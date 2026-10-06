export const subjects = ['C Programming', 'Java', 'OOP', 'DSA', 'Database', 'Mathematics', 'Other']

export function formatDate(date) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}