package com.coursett.cms.repository;

import com.coursett.cms.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /** Inbox: messages where recipient = user (top-level only) */
    List<Message> findByRecipientIdAndParentIsNullOrderByCreatedAtDesc(Long recipientId);

    /** Sent: messages where sender = user (top-level only) */
    List<Message> findBySenderIdAndParentIsNullOrderByCreatedAtDesc(Long senderId);

    /** Course discussion board: top-level messages for a course */
    List<Message> findByCourseIdAndParentIsNullOrderByCreatedAtDesc(Long courseId);

    /** Unread count for a user */
    long countByRecipientIdAndIsReadFalse(Long recipientId);

    /** All replies to a parent message */
    List<Message> findByParentIdOrderByCreatedAtAsc(Long parentId);

       /** Reply count for a parent message */
       long countByParentId(Long parentId);

    /** Inbox + course messages visible to a student (received OR course-wide) */
    @Query("SELECT m FROM Message m WHERE m.parent IS NULL AND " +
           "(m.recipient.id = :userId OR " +
           " (m.course IS NOT NULL AND m.recipient IS NULL AND " +
           "  EXISTS (SELECT e FROM Enrollment e WHERE e.student.id = :userId AND e.course.id = m.course.id AND e.status = 'APPROVED'))) " +
           "ORDER BY m.createdAt DESC")
    List<Message> findVisibleToStudent(@Param("userId") Long userId);

    /** Messages sent or received by a user — for full conversation search */
    @Query("SELECT m FROM Message m WHERE m.parent IS NULL AND " +
           "(m.sender.id = :userId OR m.recipient.id = :userId) ORDER BY m.createdAt DESC")
    List<Message> findInboxAndSentByUser(@Param("userId") Long userId);
}
