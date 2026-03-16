package com.coursett.cms.controller;

import com.coursett.cms.model.*;
import com.coursett.cms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = {
    "http://localhost:5173","http://localhost:5174","http://localhost:5175",
    "http://localhost:5176","http://localhost:5177","http://localhost:5178",
    "http://localhost:5179","http://localhost:5180","http://localhost:5181",
    "http://localhost:5182","http://localhost:5183","http://localhost:5184"
})
public class MessageController {

    @Autowired private MessageRepository messageRepository;
    @Autowired private AppUserRepository userRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;

    // ── Helper ──────────────────────────────────────────────────────────────

    private AppUser currentUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Map<String, Object> toDto(Message m) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", m.getId());
        dto.put("subject", m.getSubject());
        dto.put("body", m.getBody());
        dto.put("createdAt", m.getCreatedAt());
        dto.put("isRead", m.isRead());
        dto.put("hasReplies", !m.getReplies().isEmpty());
        dto.put("replyCount", m.getReplies().size());

        // sender info
        AppUser s = m.getSender();
        if (s != null) {
            dto.put("senderId", s.getId());
            dto.put("senderName", s.getFullName());
            dto.put("senderRole", s.getRole());
        }

        // recipient info (null = course announcement)
        AppUser r = m.getRecipient();
        if (r != null) {
            dto.put("recipientId", r.getId());
            dto.put("recipientName", r.getFullName());
            dto.put("recipientRole", r.getRole());
        }

        // course info
        Course c = m.getCourse();
        if (c != null) {
            dto.put("courseId", c.getId());
            dto.put("courseName", c.getCourseName());
            dto.put("courseCode", c.getCourseCode());
        }

        // include replies if loaded
        if (!m.getReplies().isEmpty()) {
            dto.put("replies", m.getReplies().stream().map(this::toReplyDto).collect(Collectors.toList()));
        }
        return dto;
    }

    private Map<String, Object> toReplyDto(Message m) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", m.getId());
        dto.put("body", m.getBody());
        dto.put("createdAt", m.getCreatedAt());
        dto.put("isRead", m.isRead());
        AppUser s = m.getSender();
        if (s != null) {
            dto.put("senderId", s.getId());
            dto.put("senderName", s.getFullName());
            dto.put("senderRole", s.getRole());
        }
        return dto;
    }

    // ── Inbox ────────────────────────────────────────────────────────────────

    @GetMapping("/inbox")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getInbox(
            @AuthenticationPrincipal UserDetails userDetails) {
        AppUser me = currentUser(userDetails);
        List<Message> messages;

        if (me.getRole() == Role.STUDENT) {
            messages = messageRepository.findVisibleToStudent(me.getId());
        } else {
            messages = messageRepository.findByRecipientIdAndParentIsNullOrderByCreatedAtDesc(me.getId());
        }
        return ResponseEntity.ok(messages.stream().map(this::toDto).collect(Collectors.toList()));
    }

    // ── Sent ─────────────────────────────────────────────────────────────────

    @GetMapping("/sent")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getSent(
            @AuthenticationPrincipal UserDetails userDetails) {
        AppUser me = currentUser(userDetails);
        List<Message> messages = messageRepository.findBySenderIdAndParentIsNullOrderByCreatedAtDesc(me.getId());
        return ResponseEntity.ok(messages.stream().map(this::toDto).collect(Collectors.toList()));
    }

    // ── Course Discussion ─────────────────────────────────────────────────────

    @GetMapping("/course/{courseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getCourseDiscussion(
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserDetails userDetails) {
        AppUser me = currentUser(userDetails);
        // Students must be enrolled
        if (me.getRole() == Role.STUDENT) {
            boolean enrolled = enrollmentRepository
                .findByStudentIdAndStatus(me.getId(), EnrollmentStatus.APPROVED)
                .stream().anyMatch(e -> e.getCourse().getId().equals(courseId));
            if (!enrolled) {
                return ResponseEntity.status(403).body(null);
            }
        }
        List<Message> messages = messageRepository.findByCourseIdAndParentIsNullOrderByCreatedAtDesc(courseId);
        return ResponseEntity.ok(messages.stream().map(this::toDto).collect(Collectors.toList()));
    }

    // ── Thread (message + all replies) ───────────────────────────────────────

    @GetMapping("/{id}/thread")
    @PreAuthorize("isAuthenticated()")
    @SuppressWarnings("null")
    public ResponseEntity<?> getThread(@PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Message msg = messageRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Message not found"));
        AppUser me = currentUser(userDetails);
        // Check visibility
        boolean isRecipient = msg.getRecipient() != null && msg.getRecipient().getId().equals(me.getId());
        boolean isSender    = msg.getSender().getId().equals(me.getId());
        boolean isCourseMsg = msg.getCourse() != null && msg.getRecipient() == null;
        boolean isStaff     = me.getRole() != Role.STUDENT;
        if (!isSender && !isRecipient && !(isCourseMsg && (isStaff ||
                enrollmentRepository.findByStudentIdAndStatus(me.getId(), EnrollmentStatus.APPROVED)
                    .stream().anyMatch(e -> e.getCourse().getId().equals(msg.getCourse().getId()))))) {
            return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
        }
        // Mark as read
        if (isRecipient && !msg.isRead()) {
            msg.setRead(true);
            messageRepository.save(msg);
        }
        return ResponseEntity.ok(toDto(msg));
    }

    // ── Unread Count ──────────────────────────────────────────────────────────

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        AppUser me = currentUser(userDetails);
        long count = messageRepository.countByRecipientIdAndIsReadFalse(me.getId());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    // ── Send a new message ────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @SuppressWarnings("null")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            AppUser sender = currentUser(userDetails);
            String body = (String) request.get("body");
            if (body == null || body.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Message body is required"));
            }

            Message msg = new Message();
            msg.setSender(sender);
            msg.setSubject((String) request.get("subject"));
            msg.setBody(body.trim());

            // Recipient (optional — null = course announcement)
            if (request.get("recipientId") != null) {
                Long recipId = Long.valueOf(request.get("recipientId").toString());
                AppUser recipient = userRepository.findById(recipId)
                    .orElseThrow(() -> new RuntimeException("Recipient not found"));
                msg.setRecipient(recipient);
            }

            // Course scope (optional)
            if (request.get("courseId") != null) {
                Long courseId = Long.valueOf(request.get("courseId").toString());
                Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));
                msg.setCourse(course);
            }

            // Students can only message faculty/admin — enforce
            if (sender.getRole() == Role.STUDENT && msg.getRecipient() != null) {
                Role rRole = msg.getRecipient().getRole();
                if (rRole == Role.STUDENT) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Students cannot message other students directly"));
                }
            }

            Message saved = messageRepository.save(msg);
            return ResponseEntity.ok(toDto(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Reply to a message ────────────────────────────────────────────────────

    @PostMapping("/{id}/reply")
    @PreAuthorize("isAuthenticated()")
    @SuppressWarnings("null")
    public ResponseEntity<?> replyToMessage(@PathVariable Long id,
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            AppUser sender = currentUser(userDetails);
            Message parent = messageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found"));

            String body = (String) request.get("body");
            if (body == null || body.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Reply body is required"));
            }

            Message reply = new Message();
            reply.setSender(sender);
            reply.setBody(body.trim());
            reply.setParent(parent);
            reply.setCourse(parent.getCourse());

            // Auto-set recipient as the other party
            if (parent.getRecipient() != null && parent.getRecipient().getId().equals(sender.getId())) {
                reply.setRecipient(parent.getSender());
            } else if (!parent.getSender().getId().equals(sender.getId())) {
                reply.setRecipient(parent.getSender());
            }

            Message saved = messageRepository.save(reply);
            return ResponseEntity.ok(toReplyDto(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Mark as read ──────────────────────────────────────────────────────────

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @SuppressWarnings("null")
    public ResponseEntity<?> markRead(@PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Message msg = messageRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Message not found"));
        AppUser me = currentUser(userDetails);
        if (msg.getRecipient() != null && msg.getRecipient().getId().equals(me.getId())) {
            msg.setRead(true);
            messageRepository.save(msg);
        }
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    // ── Delete a message ──────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @SuppressWarnings("null")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Message msg = messageRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Message not found"));
        AppUser me = currentUser(userDetails);
        // Only sender or admin can delete
        if (!msg.getSender().getId().equals(me.getId()) && me.getRole() != Role.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Not allowed"));
        }
        messageRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    // ── List faculty/staff for compose dialog ────────────────────────────────

    @GetMapping("/contacts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getContacts(
            @AuthenticationPrincipal UserDetails userDetails) {
        AppUser me = currentUser(userDetails);
        List<AppUser> contacts;

        if (me.getRole() == Role.STUDENT) {
            // Students can only contact faculty, hod, admin
            contacts = userRepository.findByRole(Role.FACULTY);
            contacts.addAll(userRepository.findByRole(Role.HOD));
            contacts.addAll(userRepository.findByRole(Role.ADMIN));
        } else {
            // Staff can contact any user
            contacts = userRepository.findAll();
        }

        List<Map<String, Object>> result = contacts.stream()
            .filter(u -> !u.getId().equals(me.getId()))
            .map(u -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", u.getId());
                m.put("fullName", u.getFullName());
                m.put("username", u.getUsername());
                m.put("role", u.getRole());
                return m;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
