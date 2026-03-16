import React, { useState, useEffect, useCallback } from 'react';
import {
  getInbox, getSentMessages, getCourseDiscussion,
  getThread, sendMessage, replyToMessage, markRead,
  deleteMessage, getContacts, getUnreadCount
} from '../api/messageApi';
import { getCourses, getMyEnrolledCourses } from '../api/courseApi';
import { getAuth } from '../api/authApi';
import './MessagingCenter.css';

const MessagingCenter = () => {
  const auth = getAuth();
  const isStudent = auth?.role === 'STUDENT';

  // ── tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('inbox');
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [discussion, setDiscussion] = useState([]);
  const [unread, setUnread] = useState(0);
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyText, setReplyText] = useState('');

  // ── compose ────────────────────────────────────────────────────────────────
  const [showCompose, setShowCompose] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [compose, setCompose] = useState({
    recipientId: '', courseId: '', subject: '', body: '', isAnnouncement: false
  });

  // ── course discussion ─────────────────────────────────────────────────────
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── load on mount ──────────────────────────────────────────────────────────
  const loadInbox = useCallback(async () => {
    try {
      const data = await getInbox();
      setInbox(data);
    } catch (_) { /* silent */ }
  }, []);

  const loadSent = useCallback(async () => {
    try {
      const data = await getSentMessages();
      setSent(data);
    } catch (_) { /* silent */ }
  }, []);

  const loadUnread = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnread(count);
    } catch (_) { /* silent */ }
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingList(true);
      setError('');
      try {
        await Promise.all([loadInbox(), loadSent(), loadUnread()]);
        const c = await getContacts();
        setContacts(c);

        const courseList = isStudent ? await getMyEnrolledCourses() : await getCourses();
        setCourses(courseList || []);
        if (courseList && courseList.length > 0) {
          setSelectedCourseId(String(courseList[0].id));
        }
      } catch (e) {
        setError(e.response?.data?.message || 'Unable to load messages. Please refresh or login again.');
      } finally {
        setLoadingList(false);
      }
    })();
  }, [loadInbox, loadSent, loadUnread, isStudent]);

  useEffect(() => {
    if (activeTab === 'discussion' && selectedCourseId) {
      (async () => {
        try {
          setError('');
          const data = await getCourseDiscussion(selectedCourseId);
          setDiscussion(data);
        } catch (e) {
          setError(e.response?.data?.message || 'Unable to load course discussion.');
        }
      })();
    }
  }, [activeTab, selectedCourseId]);

  // ── open thread ────────────────────────────────────────────────────────────
  const openThread = async (msg) => {
    try {
      const thread = await getThread(msg.id);
      setSelectedThread(thread);
      setReplyText('');
      if (!msg.isRead && msg.recipientId === auth?.id) {
        await markRead(msg.id);
        loadInbox();
        loadUnread();
      }
    } catch (e) {
      setError('Failed to load thread.');
    }
  };

  // ── send reply ─────────────────────────────────────────────────────────────
  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      setLoading(true);
      await replyToMessage(selectedThread.id, replyText.trim());
      setReplyText('');
      const updated = await getThread(selectedThread.id);
      setSelectedThread(updated);
      setSuccess('Reply sent.');
      setTimeout(() => setSuccess(''), 3000);
      loadInbox();
      loadSent();
    } catch (e) {
      setError('Failed to send reply.');
    } finally {
      setLoading(false);
    }
  };

  // ── send new message ───────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!compose.body.trim()) {
      setError('Message body is required.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const payload = {
        body: compose.body.trim(),
        subject: compose.subject.trim() || undefined,
        recipientId: compose.isAnnouncement ? undefined : (compose.recipientId || undefined),
        courseId: compose.courseId || undefined,
      };
      await sendMessage(payload);
      setCompose({ recipientId: '', courseId: '', subject: '', body: '', isAnnouncement: false });
      setShowCompose(false);
      setSuccess('Message sent!');
      setTimeout(() => setSuccess(''), 3000);
      loadInbox();
      loadSent();
      if (compose.courseId === selectedCourseId) {
        const data = await getCourseDiscussion(selectedCourseId);
        setDiscussion(data);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  // ── delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (msgId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await deleteMessage(msgId);
      if (selectedThread?.id === msgId) setSelectedThread(null);
      loadInbox();
      loadSent();
      if (activeTab === 'discussion') {
        const data = await getCourseDiscussion(selectedCourseId);
        setDiscussion(data);
      }
    } catch (e) {
      setError('Failed to delete.');
    }
  };

  // ── role label ─────────────────────────────────────────────────────────────
  const roleLabel = (role) => {
    const map = { ADMIN: 'Admin', FACULTY: 'Faculty', HOD: 'HOD', STUDENT: 'Student' };
    return map[role] || role;
  };

  const formatDate = (dt) => dt ? new Date(dt).toLocaleString() : '';

  // ── message list item ──────────────────────────────────────────────────────
  const MessageRow = ({ msg, showSender = true }) => (
    <div
      className={`msg-row ${!msg.isRead && showSender ? 'msg-unread' : ''}`}
      onClick={() => openThread(msg)}
    >
      <div className="msg-row-main">
        <span className="msg-who">
          {showSender
            ? <><strong>{msg.senderName}</strong> <span className={`role-badge role-${(msg.senderRole || '').toLowerCase()}`}>[{roleLabel(msg.senderRole)}]</span></>
            : <><strong>To: {msg.recipientName || 'Course Announcement'}</strong></>
          }
        </span>
        {msg.courseCode && <span className="course-tag">{msg.courseCode}</span>}
        <span className="msg-subject">{msg.subject || '(no subject)'}</span>
        <span className="msg-preview">{msg.body?.slice(0, 80)}{msg.body?.length > 80 ? '…' : ''}</span>
      </div>
      <div className="msg-row-meta">
        {msg.replyCount > 0 && <span className="msg-replies">💬 {msg.replyCount}</span>}
        <span className="msg-date">{formatDate(msg.createdAt)}</span>
        <button className="btn-icon-danger" onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }} title="Delete">🗑</button>
      </div>
    </div>
  );

  const currentList = activeTab === 'inbox' ? inbox : activeTab === 'sent' ? sent : discussion;

  return (
    <div className="messaging-center">
      <div className="messaging-header">
        <h2>📬 Messages &amp; Doubts</h2>
        <button className="btn btn-primary compose-btn" onClick={() => setShowCompose(true)}>
          ✉ Compose
        </button>
      </div>

      {error && <div className="error-message">{error}<button onClick={() => setError('')} style={{marginLeft:'8px',cursor:'pointer'}}>✕</button></div>}
      {success && <div className="success-message">{success}</div>}

      {/* ── Compose Modal ─────────────────────────────────────────────────── */}
      {showCompose && (
        <div className="modal-overlay" onClick={() => setShowCompose(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>New Message</h3>
            <form onSubmit={handleSend}>
              {!isStudent && (
                <div className="form-group">
                  <label>
                    <input type="checkbox" checked={compose.isAnnouncement}
                      onChange={e => setCompose(p => ({ ...p, isAnnouncement: e.target.checked, recipientId: '' }))} />
                    {' '}Course Announcement (no specific recipient)
                  </label>
                </div>
              )}

              {!compose.isAnnouncement && (
                <div className="form-group">
                  <label>To *</label>
                  <select value={compose.recipientId}
                    onChange={e => setCompose(p => ({ ...p, recipientId: e.target.value }))} required={!compose.isAnnouncement}>
                    <option value="">-- Select recipient --</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>{c.fullName} [{roleLabel(c.role)}]</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Course (optional)</label>
                <select value={compose.courseId}
                  onChange={e => setCompose(p => ({ ...p, courseId: e.target.value }))}>
                  <option value="">-- No course --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.courseCode} — {c.courseName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input type="text" value={compose.subject}
                  onChange={e => setCompose(p => ({ ...p, subject: e.target.value }))}
                  placeholder="Subject (optional)" />
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea rows={5} value={compose.body}
                  onChange={e => setCompose(p => ({ ...p, body: e.target.value }))}
                  placeholder="Write your message or doubt here…" required />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Sending…' : 'Send'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCompose(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Thread Viewer ─────────────────────────────────────────────────── */}
      {selectedThread && (
        <div className="thread-panel">
          <div className="thread-header">
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedThread(null)}>← Back</button>
            <h3>{selectedThread.subject || '(no subject)'}</h3>
            {selectedThread.courseCode && <span className="course-tag">{selectedThread.courseCode} — {selectedThread.courseName}</span>}
          </div>

          {/* original message */}
          <div className="thread-message original">
            <div className="thread-msg-meta">
              <strong>{selectedThread.senderName}</strong>
              <span className={`role-badge role-${(selectedThread.senderRole||'').toLowerCase()}`}>[{roleLabel(selectedThread.senderRole)}]</span>
              <span className="msg-date">{formatDate(selectedThread.createdAt)}</span>
            </div>
            <p className="thread-msg-body">{selectedThread.body}</p>
          </div>

          {/* replies */}
          {selectedThread.replies?.map(r => (
            <div key={r.id} className={`thread-message reply ${r.senderId === auth?.id ? 'mine' : 'theirs'}`}>
              <div className="thread-msg-meta">
                <strong>{r.senderName}</strong>
                <span className={`role-badge role-${(r.senderRole||'').toLowerCase()}`}>[{roleLabel(r.senderRole)}]</span>
                <span className="msg-date">{formatDate(r.createdAt)}</span>
              </div>
              <p className="thread-msg-body">{r.body}</p>
            </div>
          ))}

          {/* reply composer */}
          <form className="reply-form" onSubmit={handleReply}>
            <textarea rows={3} value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply…" />
            <button type="submit" className="btn btn-primary" disabled={loading || !replyText.trim()}>
              {loading ? 'Sending…' : 'Send Reply'}
            </button>
          </form>
        </div>
      )}

      {/* ── Tab bar ───────────────────────────────────────────────────────── */}
      {!selectedThread && (
        <>
          {loadingList && <p className="empty-msg">Loading messages...</p>}

          <div className="msg-tabs">
            <button className={activeTab === 'inbox' ? 'active' : ''} onClick={() => setActiveTab('inbox')}>
              Inbox {unread > 0 && <span className="unread-badge">{unread}</span>}
            </button>
            <button className={activeTab === 'sent' ? 'active' : ''} onClick={() => setActiveTab('sent')}>
              Sent
            </button>
            <button className={activeTab === 'discussion' ? 'active' : ''} onClick={() => setActiveTab('discussion')}>
              Course Discussion
            </button>
          </div>

          {/* course picker for discussion tab */}
          {activeTab === 'discussion' && (
            <div className="discussion-course-picker">
              <label><strong>Course:</strong></label>
              <select
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                disabled={courses.length === 0}
              >
                {courses.length === 0 && <option value="">No courses available</option>}
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.courseCode} — {c.courseName}</option>
                ))}
              </select>
            </div>
          )}

          {/* message list */}
          <div className="msg-list">
            {!loadingList && currentList.length === 0 ? (
              <p className="empty-msg">
                {activeTab === 'inbox' ? 'Your inbox is empty.' :
                 activeTab === 'sent'  ? 'No sent messages.' :
                 'No discussions yet for this course.'}
                <br />
                <button className="btn btn-primary btn-sm" style={{ marginTop: '10px' }} onClick={() => setShowCompose(true)}>
                  Compose Your First Message
                </button>
              </p>
            ) : (
              currentList.map(msg => (
                <MessageRow key={msg.id} msg={msg} showSender={activeTab !== 'sent'} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MessagingCenter;
