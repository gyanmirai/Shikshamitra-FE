'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { SplashScreen } from 'src/components/loading-screen';
import { completeSignInUser } from 'src/redux/auth/authActions';

const Callback = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  useEffect(() => {
    const handleSignIn = async () => {
      try {
        await dispatch(completeSignInUser() as any).unwrap();
        router.push('/dashboard'); // Redirect to a specific page after successful sign-in
      } catch (error) {
        console.error('Sign-in failed:', error);
        router.push('/login');
      }
    };

    handleSignIn();
  }, [dispatch, router]);

  return <SplashScreen />;
};

export default Callback;
