import ora, { Ora } from 'ora'

let spinner: Ora | null = null
export function loading(message?: string) {
  spinner = ora(message || 'The export file is being generated... \n').start()
}
export function loadEnd(message?: string) {
  spinner?.succeed(message || 'The export file is generated successfully.')
}
