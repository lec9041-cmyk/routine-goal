import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mwbyfhvbriqenwzuoawv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_1jro0zmPLskjLlEbxmEl1w_mhnsHPLt';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export async function signUpWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('[signUpWithEmail] 회원가입 실패:', error.message);
      return { data: null, error };
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[signInWithEmail] 로그인 실패:', error.message);
      return { data: null, error };
    }

    console.log('[signInWithEmail] 로그인 성공:', data);
    return { data, error: null };
  } catch (err) {
    console.error('[signInWithEmail] 예외 발생:', err);
    return { data: null, error: err };
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('[getCurrentUser] 사용자 조회 실패:', error.message);
      return { user: null, error };
    }

    console.log('[getCurrentUser] 현재 사용자:', data.user);
    return { user: data.user, error: null };
  } catch (err) {
    console.error('[getCurrentUser] 예외 발생:', err);
    return { user: null, error: err };
  }
}

export async function insertRoutine(routineInput) {
  try {
    const { user, error: userError } = await getCurrentUser();

    if (userError) {
      console.error('[insertRoutine] 사용자 확인 실패:', userError.message);
      return { data: null, error: userError };
    }

    if (!user) {
      const notLoggedInError = new Error('로그인이 필요합니다. 로그인 후 다시 시도하세요.');
      console.error('[insertRoutine] 로그인되지 않은 상태:', notLoggedInError.message);
      return { data: null, error: notLoggedInError };
    }

    const payload = {
      ...routineInput,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('routines')
      .insert(payload)
      .select();

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
    const { user, error: userError } = await getCurrentUser();

    if (userError) {
      console.error('[fetchRoutines] 사용자 확인 실패:', userError.message);
      return { data: null, error: userError };
    }

    if (!user) {
      const notLoggedInError = new Error('로그인이 필요합니다.');
      console.error('[fetchRoutines] 로그인되지 않은 상태:', notLoggedInError.message);
      return { data: null, error: notLoggedInError };
    }

    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

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
