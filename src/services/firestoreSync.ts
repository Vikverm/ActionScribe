import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { MeetingRecord, InvoiceRecord, ClientUser } from '../types';

/**
 * Synchronize User profile to Firestore
 */
export async function syncUserProfileToFirestore(user: ClientUser): Promise<void> {
  if (!user || !user.id || !auth.currentUser || auth.currentUser.uid !== user.id) return;
  const path = `users/${user.id}`;
  try {
    const userDocRef = doc(db, 'users', user.id);
    await setDoc(userDocRef, {
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company || '',
      persona: user.persona,
      currentPlan: user.currentPlan,
      avatarColor: user.avatarColor || 'bg-indigo-600',
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save or update a meeting record in Firestore
 */
export async function saveMeetingToFirestore(meeting: MeetingRecord, userId: string): Promise<void> {
  if (!meeting || !meeting.id || !auth.currentUser || auth.currentUser.uid !== userId) return;
  const path = `meetings/${meeting.id}`;
  try {
    const meetingDocRef = doc(db, 'meetings', meeting.id);
    await setDoc(meetingDocRef, {
      id: meeting.id,
      userId,
      title: meeting.title,
      type: meeting.type,
      template: meeting.template,
      date: meeting.date,
      durationMinutes: meeting.durationMinutes,
      attendees: meeting.attendees || [],
      summary: meeting.summary || '',
      keyDiscussionPoints: meeting.keyDiscussionPoints || [],
      decisions: meeting.decisions || [],
      actionItems: meeting.actionItems || [],
      followUpEmail: meeting.followUpEmail || null,
      candidateScorecard: meeting.candidateScorecard || null,
      sentiment: meeting.sentiment,
      transcript: meeting.transcript || [],
      workspace: meeting.workspace || 'personal',
      status: meeting.status || 'completed',
      folder: meeting.folder || null,
      tags: meeting.tags || [],
      isPublicShared: !!meeting.isPublicShared,
      publicShareToken: meeting.publicShareToken || null,
      customExtractions: meeting.customExtractions || [],
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a meeting record from Firestore
 */
export async function deleteMeetingFromFirestore(meetingId: string): Promise<void> {
  if (!meetingId || !auth.currentUser) return;
  const path = `meetings/${meetingId}`;
  try {
    const meetingDocRef = doc(db, 'meetings', meetingId);
    await deleteDoc(meetingDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribe to real-time meeting updates for a specific user
 */
export function subscribeToUserMeetings(
  userId: string,
  onMeetingsUpdate: (meetings: MeetingRecord[]) => void
): () => void {
  // If not authenticated in Firebase Auth or userId doesn't match the authenticated UID, do not query
  if (!userId || !auth.currentUser || auth.currentUser.uid !== userId) {
    return () => {};
  }

  const path = 'meetings';
  try {
    const q = query(collection(db, 'meetings'), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const meetingsList: MeetingRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          meetingsList.push({
            id: data.id || docSnap.id,
            title: data.title,
            type: data.type || 'client_call',
            template: data.template || 'standard',
            date: data.date,
            durationMinutes: data.durationMinutes || 30,
            attendees: data.attendees || [],
            summary: data.summary || '',
            keyDiscussionPoints: data.keyDiscussionPoints || [],
            decisions: data.decisions || [],
            actionItems: data.actionItems || [],
            followUpEmail: data.followUpEmail || {
              subject: '',
              recipients: [],
              greeting: '',
              body: '',
              signoff: '',
              tone: 'concise',
            },
            candidateScorecard: data.candidateScorecard,
            sentiment: data.sentiment || {
              overall: 'neutral',
              timeSavedMinutes: 45,
            },
            transcript: data.transcript || [],
            workspace: data.workspace || 'personal',
            status: data.status || 'completed',
            folder: data.folder || undefined,
            tags: data.tags || undefined,
            isPublicShared: data.isPublicShared || false,
            publicShareToken: data.publicShareToken || undefined,
            customExtractions: data.customExtractions || undefined,
          });
        });
        if (meetingsList.length > 0) {
          onMeetingsUpdate(meetingsList);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

/**
 * Save an invoice to Firestore
 */
export async function saveInvoiceToFirestore(invoice: InvoiceRecord, userId: string): Promise<void> {
  if (!invoice || !invoice.id || !auth.currentUser || auth.currentUser.uid !== userId) return;
  const path = `invoices/${invoice.id}`;
  try {
    const invoiceDocRef = doc(db, 'invoices', invoice.id);
    await setDoc(invoiceDocRef, {
      id: invoice.id,
      userId,
      date: invoice.date,
      planId: invoice.planId,
      planName: invoice.planName,
      amountUSD: invoice.amountUSD,
      amountINR: invoice.amountINR,
      billingCycle: invoice.billingCycle,
      paymentMethod: invoice.paymentMethod,
      paymentRef: invoice.paymentRef,
      upiId: invoice.upiId || '',
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      companyName: invoice.companyName || '',
      billingAddress: invoice.billingAddress || '',
      status: invoice.status,
      createdAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribe to real-time invoices for a user
 */
export function subscribeToUserInvoices(
  userId: string,
  onInvoicesUpdate: (invoices: InvoiceRecord[]) => void
): () => void {
  // If not authenticated in Firebase Auth or userId doesn't match the authenticated UID, do not query
  if (!userId || !auth.currentUser || auth.currentUser.uid !== userId) {
    return () => {};
  }

  const path = 'invoices';
  try {
    const q = query(collection(db, 'invoices'), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: InvoiceRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push(data as InvoiceRecord);
        });
        if (list.length > 0) {
          onInvoicesUpdate(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}
