export interface UserMonogramInfo {
  displayName: string;
  initials: string;
  bgColor: string;
  textColor: string;
}

export function getUserMonogram(
  userName?: string | null,
  userEmail?: string | null
): UserMonogramInfo {
  let displayName = '';
  let initials = 'P';

  if (userName && userName.trim()) {
    displayName = userName.trim();
    const parts = displayName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      initials = `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    } else {
      initials = displayName.charAt(0).toUpperCase();
    }
  } else if (userEmail && userEmail.trim()) {
    const localPart = userEmail.split('@')[0];
    const cleaned = localPart.replace(/[._-]/g, ' ').trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      displayName = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
      initials = `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    } else {
      displayName = localPart.charAt(0).toUpperCase() + localPart.slice(1);
      initials = localPart.charAt(0).toUpperCase();
    }
  } else {
    displayName = 'Guest Account';
    initials = 'G';
  }

  return {
    displayName,
    initials,
    bgColor: 'from-emerald-600 via-teal-600 to-emerald-700',
    textColor: 'text-white',
  };
}
