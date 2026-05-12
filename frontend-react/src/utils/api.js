const API_BASE = '/api';

export function getToken() {
  return localStorage.getItem('sss_token');
}

export function getCoach() {
  try {
    return JSON.parse(localStorage.getItem('sss_coach') || '{}');
  } catch {
    return {};
  }
}

export function saveAuth(token, coach) {
  localStorage.setItem('sss_token', token);
  localStorage.setItem('sss_coach', JSON.stringify(coach));
}

export function logout() {
  localStorage.removeItem('sss_token');
  localStorage.removeItem('sss_coach');
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    cache: 'no-store',
    headers,
  });

  if (response.status === 401) {
    logout();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = payload?.error || payload?.message || 'Request failed';
    throw new Error(message);
  }

  return payload;
}

export function initials(name) {
  return (name || '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function toneForScore(score) {
  if (score >= 70) return '#639922';
  if (score >= 40) return '#c9a84c';
  return '#E8372A';
}

export function avatarColors(name) {
  const colors = [
    ['#3C3489', '#AFA9EC'],
    ['#185FA5', '#85B7EB'],
    ['#854F0B', '#FAC775'],
    ['#993C1D', '#F0997B'],
    ['#1A6B45', '#7EC8A4'],
    ['#5C1A7A', '#C489E6'],
  ];
  const idx = (name || '').charCodeAt(0) % colors.length;
  return colors[idx];
}
