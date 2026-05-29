import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from './client';

const mock = new MockAdapter(apiClient);

beforeEach(() => {
  mock.reset();
  localStorage.clear();
  Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('apiClient 요청 인터셉터', () => {
  it('localStorage에 token이 있으면 Authorization 헤더를 추가한다', async () => {
    localStorage.setItem('token', 'test-jwt-token');
    mock.onGet('/test').reply(200, {});

    await apiClient.get('/test');

    expect(mock.history.get[0].headers?.Authorization).toBe('Bearer test-jwt-token');
  });

  it('localStorage에 token이 없으면 Authorization 헤더를 추가하지 않는다', async () => {
    mock.onGet('/test').reply(200, {});

    await apiClient.get('/test');

    expect(mock.history.get[0].headers?.Authorization).toBeUndefined();
  });
});

describe('apiClient 응답 인터셉터', () => {
  it('401 응답 시 window.location.href를 /login으로 설정한다', async () => {
    mock.onGet('/protected').reply(401);

    await expect(apiClient.get('/protected')).rejects.toThrow();

    expect(window.location.href).toBe('/login');
  });

  it('401 이외의 에러는 window.location.href를 변경하지 않는다', async () => {
    mock.onGet('/forbidden').reply(403);

    await expect(apiClient.get('/forbidden')).rejects.toThrow();

    expect(window.location.href).toBe('');
  });
});
