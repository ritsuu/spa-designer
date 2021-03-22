export function getLocationSearch() {
  return location.search.replace(/\?/, '')
}

export function copyText(txt: string): boolean {
  const input = document.createElement('input')
  document.body.appendChild(input)
  input.value = txt
  input.select()
  document.execCommand('copy')
  document.body.removeChild(input)
  return true
}

export function isJSON(str: string): boolean {
  try {
    if (typeof JSON.parse(str) == 'object') {
      return true
    }
  } catch (error) {
    return false
  }

  return false
}