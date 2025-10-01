type Session = {
  id: string;
  userId: string | null;
  startedAt: number;
  durationMin: number;
};
const _sessions: Session[] = [];

export function addSession(session: Session) {
  _sessions.push(session);
}

export function listSessions(userId?: string | null) {
  return userId == null
    ? _sessions
    : _sessions.filter((s) => s.userId === userId);
}
