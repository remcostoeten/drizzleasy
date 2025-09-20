'use client'

import { Files, File } from 'fumadocs-ui/components/files'
type TProps = {
  children: JSX.Element | JSX.Element[]
}

export function InteractiveFiles({ children }: TProps) {
  return <Files>{children}</Files>
}

type TFileProps = {
  name: string
  lang?: string
  children: string
}

export function InteractiveFile({ name, lang, children }: TFileProps) {
  return <File name={name} lang={lang}>{children}</File>
}