"use client";

import { useRouter } from 'next/navigation';

const CompletePage = () => {
  const router = useRouter();

  const handleNext = () => {
    router.push('/mypage');
  };

  const handlePrevious = () => {
    router.push('/register/pregnant/pregnancy-info/5');
  };

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default CompletePage; 