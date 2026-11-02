import { useState } from 'react';
import { LegalTab } from '../components/LegalModal';

export function useModals() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTrialBlockedModalOpen, setIsTrialBlockedModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('terms');

  return {
    isLoginModalOpen,
    setIsLoginModalOpen,
    isTrialBlockedModalOpen,
    setIsTrialBlockedModalOpen,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    isAdminModalOpen,
    setIsAdminModalOpen,
    isLegalModalOpen,
    setIsLegalModalOpen,
    isPrintModalOpen,
    setIsPrintModalOpen,
    legalModalTab,
    setLegalModalTab,
  };
}
