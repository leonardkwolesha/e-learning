import React, { createContext, useContext, useEffect, useState } from 'react';
import { EduProfile, Subject } from '../types';
import { getEduProfile, saveEduProfile, clearEduProfile } from '../lib/storage';
import { getSubjectsForProfile } from '../data/subjects';

interface ProfileContextType {
  profile: EduProfile | null;
  subjects: Subject[];
  loading: boolean;
  setProfile: (profile: EduProfile) => Promise<void>;
  clearProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({} as ProfileContextType);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<EduProfile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    const stored = await getEduProfile();
    setProfileState(stored);
    if (stored) {
      setSubjects(getSubjectsForProfile(stored.educationType, stored.level, stored.form));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const setProfile = async (profile: EduProfile) => {
    await saveEduProfile(profile);
    setProfileState(profile);
    setSubjects(getSubjectsForProfile(profile.educationType, profile.level, profile.form));
  };

  const clearProfile = async () => {
    await clearEduProfile();
    setProfileState(null);
    setSubjects([]);
  };

  const refreshProfile = async () => {
    setLoading(true);
    await loadProfile();
  };

  return (
    <ProfileContext.Provider value={{ profile, subjects, loading, setProfile, clearProfile, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
