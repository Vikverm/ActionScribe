import { MeetingRecord } from '../types';

export function generateNotionMarkdown(meeting: MeetingRecord): string {
  const dateStr = new Date(meeting.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const decisionsList = meeting.decisions
    .map((d) => `- **${d.text}** ${d.context ? `_(${d.context})_` : ''}`)
    .join('\n');

  const actionItemsList = meeting.actionItems
    .map(
      (a) =>
        `- [${a.completed ? 'x' : ' '}] **${a.task}** | @${a.assignee} | 📅 Due: ${a.deadline} | Priority: ${a.priority.toUpperCase()}`
    )
    .join('\n');

  const keyPointsList = meeting.keyDiscussionPoints
    .map((p) => `- ${p}`)
    .join('\n');

  return `# 📝 ${meeting.title}

> **Date:** ${dateStr}  
> **Duration:** ${meeting.durationMinutes} mins  
> **Attendees:** ${meeting.attendees.join(', ')}  
> **Type:** ${meeting.type.replace('_', ' ').toUpperCase()}  
> **Estimated Time Saved:** ${meeting.sentiment.timeSavedMinutes} minutes

---

## 🎯 Executive Summary
${meeting.summary}

---

## 💡 Key Discussion Points
${keyPointsList || '- No explicit discussion points recorded.'}

---

## ⚖️ Decisions Made
${decisionsList || '- No formal decisions recorded.'}

---

## 📋 Action Items & Deadlines
${actionItemsList || '- No pending action items.'}

---

## ✉️ Follow-Up Email Sent / Drafted
**Subject:** ${meeting.followUpEmail.subject}
**Recipients:** ${meeting.followUpEmail.recipients.join(', ')}

\`\`\`text
${meeting.followUpEmail.body}
\`\`\`

---
*Generated with ActionScribe AI Meeting Scribe*
`;
}

export function generateSlackMarkdown(meeting: MeetingRecord): string {
  const decisions = meeting.decisions.map((d) => `• *${d.text}*`).join('\n');
  const actionItems = meeting.actionItems
    .map(
      (a) =>
        `• ${a.completed ? '✅' : '⏳'} *${a.task}* — <@${a.assignee}> (Due: \`${a.deadline}\` | *${a.priority.toUpperCase()}*)`
    )
    .join('\n');

  return `:memo: *Meeting Recap: ${meeting.title}*
:calendar: *Date:* ${meeting.date} | :stopwatch: *Duration:* ${meeting.durationMinutes}m | :zap: *Time Saved:* ${meeting.sentiment.timeSavedMinutes}m
:busts_in_silhouette: *Attendees:* ${meeting.attendees.join(', ')}

*Summary:*
${meeting.summary}

:dart: *Decisions Made:*
${decisions || '• None recorded.'}

:white_check_mark: *Next Steps & Action Items:*
${actionItems || '• All action items completed.'}

_Generated via ActionScribe AI_`;
}

export function generateCrmJson(meeting: MeetingRecord): string {
  return JSON.stringify(
    {
      crm_event: 'MEETING_COMPLETED',
      activity_type: meeting.type,
      subject: meeting.title,
      date: meeting.date,
      duration_minutes: meeting.durationMinutes,
      participants: meeting.attendees,
      notes_body: meeting.summary,
      decisions: meeting.decisions.map((d) => ({
        decision: d.text,
        category: d.category,
        context: d.context || '',
      })),
      tasks_created: meeting.actionItems.map((a) => ({
        task_name: a.task,
        assigned_to: a.assignee,
        due_date: a.deadline,
        priority: a.priority,
        status: a.completed ? 'COMPLETED' : 'OPEN',
      })),
      follow_up_email: {
        subject: meeting.followUpEmail.subject,
        recipients: meeting.followUpEmail.recipients,
      },
      metadata: {
        time_saved_minutes: meeting.sentiment.timeSavedMinutes,
        sentiment: meeting.sentiment.overall,
        tool: 'ActionScribe AI',
      },
    },
    null,
    2
  );
}

// Notta-parity format: SRT Subtitles
export function generateSrtSubtitles(meeting: MeetingRecord): string {
  if (!meeting.transcript || meeting.transcript.length === 0) {
    return `1\n00:00:00,000 --> 00:00:05,000\n[Summary] ${meeting.summary}\n`;
  }

  const parseTimeToSeconds = (tStr: string) => {
    const parts = tStr.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  const formatSrtTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = 0;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  };

  return meeting.transcript
    .map((entry, idx) => {
      const startSec = parseTimeToSeconds(entry.time);
      const endSec = startSec + Math.max(3, Math.min(8, Math.round(entry.text.length / 15)));
      return `${idx + 1}\n${formatSrtTime(startSec)} --> ${formatSrtTime(endSec)}\n${entry.speaker}: ${entry.text}\n`;
    })
    .join('\n');
}

// Notta-parity format: Timestamped Text file (.txt)
export function generateTimestampedTxt(meeting: MeetingRecord): string {
  const header = `======================================================
MEETING TRANSCRIPT & EXECUTIVE SUMMARY
Title: ${meeting.title}
Date: ${meeting.date} | Duration: ${meeting.durationMinutes} mins
Attendees: ${meeting.attendees.join(', ')}
Generated with: ActionScribe AI (app.notta.ai parity)
======================================================

EXECUTIVE SUMMARY:
${meeting.summary}

KEY DECISIONS:
${meeting.decisions.map((d, i) => `${i + 1}. [${d.category.toUpperCase()}] ${d.text}`).join('\n') || 'None recorded'}

ACTION ITEMS:
${meeting.actionItems.map((a, i) => `${i + 1}. [${a.priority.toUpperCase()}] ${a.task} (@${a.assignee} - Due: ${a.deadline})`).join('\n') || 'None recorded'}

------------------------------------------------------
FULL TIMESTAMPED TRANSCRIPT:
------------------------------------------------------
`;

  const transcriptBody = meeting.transcript
    .map((t) => `[${t.time}] ${t.speaker}:\n  ${t.text}\n`)
    .join('\n');

  return header + transcriptBody;
}

// Notta/Otter export: Microsoft Word / Google Docs formatted HTML
export function generateWordHtml(meeting: MeetingRecord): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${meeting.title}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1 { color: #0f172a; border-bottom: 2px solid #4f46e5; padding-bottom: 8px; }
    h2 { color: #334155; margin-top: 24px; }
    .badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .transcript-entry { margin-bottom: 12px; padding: 8px; background: #f8fafc; border-left: 3px solid #6366f1; border-radius: 4px; }
    .speaker { font-weight: bold; color: #4338ca; }
    .time { font-family: monospace; color: #64748b; font-size: 11px; margin-left: 8px; }
  </style>
</head>
<body>
  <h1>${meeting.title}</h1>
  <p><strong>Date:</strong> ${meeting.date} | <strong>Duration:</strong> ${meeting.durationMinutes} mins | <strong>Attendees:</strong> ${meeting.attendees.join(', ')}</p>
  
  <h2>Executive Summary</h2>
  <p>${meeting.summary}</p>
  
  <h2>Decisions Finalized</h2>
  <ul>
    ${meeting.decisions.map((d) => `<li><strong>[${d.category.toUpperCase()}]</strong> ${d.text}</li>`).join('')}
  </ul>
  
  <h2>Action Items</h2>
  <ul>
    ${meeting.actionItems.map((a) => `<li><strong>${a.task}</strong> — Assignee: ${a.assignee} (Due: ${a.deadline})</li>`).join('')}
  </ul>
  
  <h2>Meeting Transcript</h2>
  ${meeting.transcript.map((t) => `
    <div class="transcript-entry">
      <span class="speaker">${t.speaker}</span><span class="time">[${t.time}]</span>
      <div>${t.text}</div>
    </div>
  `).join('')}
</body>
</html>`;
}

export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
