export type TCommand = {
    run: (args: string[]) => void | Promise<void>
}

export type TConfig = {
    name: string
    version: string
    description: string
    commands: Record<string, TCommand>
}

export type TOption = {
    key: string
    label: string
    description?: string
    action: () => void | Promise<void>
}

export type TMenu = {
    title: string
    subtitle?: string
    options: TOption[]
}
