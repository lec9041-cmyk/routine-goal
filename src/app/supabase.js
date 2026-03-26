const SUPABASE_URL = 'https://mwbyfhvbriqenwzuoawv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_1jro0zmPLskjLlEbxmEl1w_mhnsHPLt';
const SESSION_KEY = 'routine_goal_supabase_session';

function getSavedSession() {
  const raw = localStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('[supabase] 세션 파싱 실패:', error);
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function getAuthHeaders(accessToken) {
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

async function parseResponse(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.msg || payload?.message || 'Supabase 요청 실패';
    return { data: null, error: new Error(message) };
  }

  return { data: payload, error: null };
}

export async function signUpWithEmail(email, password) {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const { data, error } = await parseResponse(response);

    if (error) {
      console.error('[signUpWithEmail] 회원가입 실패:', error.message);
      return { data: null, error };
    }

    if (data?.access_token) {
      saveSession(data);
    }

    console.log('[signUpWithEmail] 회원가입 성공:', data);
    return { data, error: null };
  } catch (err) {
    console.error('[signUpWithEmail] 예외 발생:', err);
    return { data: null, error: err };
  }
}

export async function signInWithEmail(email, password) {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const { data, error } = await parseResponse(response);

    if (error) {
      console.error('[signInWithEmail] 로그인 실패:', error.message);
      return { data: null, error };
    }

    saveSession(data);
    console.log('[signInWithEmail] 로그인 성공:', data);
    return { data, error: null };
  } catch (err) {
    console.error('[signInWithEmail] 예외 발생:', err);
    return { data: null, error: err };
  }
}

export async function signOutUser() {
  try {
    const session = getSavedSession();

    if (!session?.access_token) {
      clearSession();
      return { error: null };
    }

    const response = await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: getAuthHeaders(session.access_token),
    });

    const { error } = await parseResponse(response);
    clearSession();

    if (error) {
      console.error('[signOutUser] 로그아웃 실패:', error.message);
      return { error };
    }

    console.log('[signOutUser] 로그아웃 성공');
    return { error: null };
  } catch (err) {
    clearSession();
    console.error('[signOutUser] 예외 발생:', err);
    return { error: err };
  }
}

export async function getCurrentUser() {
  try {
    const session = getSavedSession();

    if (!session?.access_token) {
      return { user: null, error: null };
    }

    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: getAuthHeaders(session.access_token),
    });

    const { data, error } = await parseResponse(response);

    if (error) {
      console.error('[getCurrentUser] 사용자 조회 실패:', error.message);
      return { user: null, error };
    }

    console.log('[getCurrentUser] 현재 사용자:', data);
    return { user: data, error: null };
  } catch (err) {
    console.error('[getCurrentUser] 예외 발생:', err);
    return { user: null, error: err };
  }
}

export async function insertRoutine(routineInput) {
  try {
    const session = getSavedSession();
    const { user, error: userError } = await getCurrentUser();

    if (userError) {
      console.error('[insertRoutine] 사용자 확인 실패:', userError.message);
      return { data: null, error: userError };
    }

    if (!user || !session?.access_token) {
      const notLoggedInError = new Error('로그인이 필요합니다. 로그인 후 다시 시도하세요.');
      console.error('[insertRoutine] 로그인되지 않은 상태:', notLoggedInError.message);
      return { data: null, error: notLoggedInError };
    }

    const payload = {
      ...routineInput,
      user_id: user.id,
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/routines`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(session.access_token),
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    const { data, error } = await parseResponse(response);

    if (error) {
      console.error('[insertRoutine] routines insert 실패:', error.message);
      return { data: null, error };
    }

    console.log('[insertRoutine] routines insert 성공:', data);
    return { data, error: null };
  } catch (err) {
    console.error('[insertRoutine] 예외 발생:', err);
    return { data: null, error: err };
  }
}

export async function fetchRoutines() {
  try {
    const session = getSavedSession();
    const { user, error: userError } = await getCurrentUser();

    if (userError) {
      console.error('[fetchRoutines] 사용자 확인 실패:', userError.message);
      return { data: null, error: userError };
    }

    if (!user || !session?.access_token) {
      const notLoggedInError = new Error('로그인이 필요합니다.');
      console.error('[fetchRoutines] 로그인되지 않은 상태:', notLoggedInError.message);
      return { data: null, error: notLoggedInError };
    }

    const query = new URLSearchParams({
      select: '*',
      user_id: `eq.${user.id}`,
      order: 'created_at.desc',
    });

    const response = await fetch(`${SUPABASE_URL}/rest/v1/routines?${query.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(session.access_token),
    });

    const { data, error } = await parseResponse(response);

    if (error) {
      console.error('[fetchRoutines] routines 조회 실패:', error.message);
      return { data: null, error };
    }

    console.log('[fetchRoutines] routines 조회 성공:', data);
    return { data, error: null };
  } catch (err) {
    console.error('[fetchRoutines] 예외 발생:', err);
    return { data: null, error: err };
  }
}
