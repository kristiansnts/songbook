export enum UserStatusEnum {
  ACTIVE = 'active',
  PENDING = 'pending',
  REQUEST = 'request',
  SUSPEND = 'suspend',
}

export interface HasLabel {
  getLabel(): string
}

export class UserStatusEnumHelper implements HasLabel {
  constructor(private value: UserStatusEnum) {}

  static fromValue(value: string): UserStatusEnumHelper {
    const enumValue = Object.values(UserStatusEnum).find((v) => v === value)
    if (!enumValue) {
      throw new Error(`Invalid UserRole value: ${value}`)
    }
    return new UserStatusEnumHelper(enumValue)
  }

  getValue(): UserStatusEnum {
    return this.value
  }

  getLabel(): string {
    switch (this.value) {
      case UserStatusEnum.ACTIVE:
        return 'Active'
      case UserStatusEnum.PENDING:
        return 'Pending'
      case UserStatusEnum.REQUEST:
        return 'Request'
      case UserStatusEnum.SUSPEND:
        return 'Suspended'
      default:
        return 'Unknown'
    }
  }

  static getAllLabels(): Record<UserStatusEnum, string> {
    return {
      [UserStatusEnum.ACTIVE]: 'Active',
      [UserStatusEnum.PENDING]: 'Pending',
      [UserStatusEnum.REQUEST]: 'Request',
      [UserStatusEnum.SUSPEND]: 'Suspended',
    }
  }

  static getOptions(): Array<{ value: UserStatusEnum; label: string }> {
    return Object.values(UserStatusEnum).map((role) => ({
      value: role,
      label: new UserStatusEnumHelper(role).getLabel(),
    }))
  }
}
