const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('sss_token');
}

function getCoach() {
  try {
    return JSON.parse(localStorage.getItem('sss_coach') || '{}');
  } catch (error) {
    return {};
  }
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem('sss_token');
  localStorage.removeItem('sss_coach');
  window.location.href = 'login.html';
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    cache: 'no-store',
    headers,
  });

  if (response.status === 401) {
    logout();
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

function initials(name) {
  return (name || '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function toneForScore(score) {
  if (score >= 70) return '#639922';
  if (score >= 40) return '#c9a84c';
  return '#E8372A';
}

function avatarColors(name) {
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

