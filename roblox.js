import fetch from 'node-fetch';

const USERS_BASE = 'https://users.roblox.com';
const THUMB_BASE = 'https://thumbnails.roblox.com';

export async function resolveUsernameToId(username) {
  const url = `${USERS_BASE}/v1/usernames/users`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
  });
  if (!r.ok) return null;
  const data = await r.json();
  const first = data?.data?.[0];
  return first?.id || null;
}

export async function getUserProfile(userId) {
  const r = await fetch(`${USERS_BASE}/v1/users/${userId}`);
  if (!r.ok) return null;
  return await r.json();
}

export function avatarUrl(userId, size='352x352', format='Png') {
  const u = new URL(`${THUMB_BASE}/v1/users/avatar`);
  u.searchParams.set('userIds', String(userId));
  u.searchParams.set('size', size);
  u.searchParams.set('format', format);
  u.searchParams.set('isCircular', 'false');
  return u.toString();
}

export async function getUserAvatar(userId) {
  const r = await fetch(avatarUrl(userId));
  if (!r.ok) return null;
  const data = await r.json();
  const first = data?.data?.[0];
  return first || null;
}