// Department image mapping using the new comprehensive Unsplash image system
import { getDepartmentImage as getUnsplashDepartmentImage, getRoleDashboardImage, getLegacyImage } from './unsplashImages';

export const departmentImages: { [key: string]: string } = {
  'cardiology': getUnsplashDepartmentImage('cardiology'),
  'cardiologist': getUnsplashDepartmentImage('cardiology'),
  'interventional cardiology': getUnsplashDepartmentImage('cardiology'),
  'interventional cardiologist': getUnsplashDepartmentImage('cardiology'),
  'dermatology': getUnsplashDepartmentImage('dermatology'),
  'dermatologist': getUnsplashDepartmentImage('dermatology'),
  'ent': getUnsplashDepartmentImage('ent'),
  'ear nose throat': getUnsplashDepartmentImage('ent'),
  'neurology': getUnsplashDepartmentImage('neurology'),
  'neurologist': getUnsplashDepartmentImage('neurology'),
  'oncology': getUnsplashDepartmentImage('oncology'),
  'oncologist': getUnsplashDepartmentImage('oncology'),
  'orthopedics': getUnsplashDepartmentImage('orthopedics'),
  'orthopedic': getUnsplashDepartmentImage('orthopedics'),
  'pediatrics': getUnsplashDepartmentImage('pediatrics'),
  'pediatrician': getUnsplashDepartmentImage('pediatrics'),
  'radiology': getUnsplashDepartmentImage('radiology'),
  'radiologist': getUnsplashDepartmentImage('radiology'),
  'therapy': getUnsplashDepartmentImage('physiotherapy'),
  'therapist': getUnsplashDepartmentImage('physiotherapy'),
  'physical therapy': getUnsplashDepartmentImage('physiotherapy'),
  'general': getRoleDashboardImage('doctor'),
  'general medicine': getRoleDashboardImage('doctor'),
  'general physician': getRoleDashboardImage('doctor'),
  'general practitioner': getRoleDashboardImage('doctor'),
};

export const getDepartmentImage = (departmentName: string | undefined): string => {
  return getUnsplashDepartmentImage(departmentName || '');
};

export const getRoleImage = (role: string): string => {
  return getRoleDashboardImage(role);
};

export const getLoadingImage = (role: string): string => {
  return getLegacyImage('loading', role);
};