export const THEMES = {
  rush: {
    id: 'rush', name: 'RUSH', description: 'Clean white workspace with RUSH red accents.',
    vars: {'--red':'#d32323','--red2':'#b51e1e','--sidebar':'#18222b','--sidebar2':'#111920','--bg':'#f3f4f5','--panel':'#ffffff','--line':'#dfe3e6','--text':'#1c252c','--muted':'#6a747c','--hover':'#f8eeee'}
  },
  leonore: {
    id: 'leonore', name: 'Leonore', description: 'Elegant rose and soft blush palette for letters, invitations and personal documents.',
    vars: {'--red':'#c64f7b','--red2':'#9f315c','--sidebar':'#3a2430','--sidebar2':'#281a22','--bg':'#fff6fa','--panel':'#ffffff','--line':'#edd8e2','--text':'#302329','--muted':'#846874','--hover':'#fff0f6'}
  },
  melody: {
    id: 'melody', name: 'Melody', description: 'Soft creative workspace with blue, mint and warm accents.',
    vars: {'--red':'#4e7cc8','--red2':'#355e9e','--sidebar':'#1d2a38','--sidebar2':'#14202c','--bg':'#f4f8fb','--panel':'#ffffff','--line':'#d8e2ea','--text':'#1d2b36','--muted':'#6c7d89','--hover':'#edf5fb'}
  },
  royale: {
    id: 'royale', name: 'Ephraim Royale', description: 'Premium black and gold theme for executive and formal work.',
    vars: {'--red':'#c79a36','--red2':'#9f792a','--sidebar':'#111111','--sidebar2':'#080808','--bg':'#171717','--panel':'#202020','--line':'#353535','--text':'#f2ead8','--muted':'#a99e88','--hover':'#2a261d'}
  },
  notes: {
    id: 'notes', name: 'Minimal Notes', description: 'Notion-inspired neutral workspace for distraction-free writing.',
    vars: {'--red':'#5f6368','--red2':'#3c4043','--sidebar':'#f4f4f2','--sidebar2':'#ececea','--bg':'#f7f7f5','--panel':'#ffffff','--line':'#e7e7e3','--text':'#2f3437','--muted':'#787774','--hover':'#efefec'}
  },
  midnight: {
    id: 'midnight', name: 'Midnight', description: 'Low-glare dark mode for long editing sessions.',
    vars: {'--red':'#e24a4a','--red2':'#bd3434','--sidebar':'#11161c','--sidebar2':'#0b0f13','--bg':'#15191e','--panel':'#1d2228','--line':'#303740','--text':'#e9edf1','--muted':'#9ca7b2','--hover':'#272e35'}
  }
};

export function applyTheme(id='rush', custom={}) {
  const theme = THEMES[id] || THEMES.rush;
  const vars = {...theme.vars, ...(custom || {})};
  for (const [key,value] of Object.entries(vars)) document.documentElement.style.setProperty(key,value);
  document.documentElement.dataset.theme = id;
  return theme;
}

export function themeList(){ return Object.values(THEMES); }
