export enum UserRoleEnum {
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}

export interface HasLabel {
  getLabel(): string
}

export class UserRoleEnumHelper implements HasLabel {
  constructor(private value: UserRoleEnum) {}

  static fromValue(value: string): UserRoleEnumHelper {
    const enumValue = Object.values(UserRoleEnum).find((v) => v === value)
    if (!enumValue) {
      throw new Error(`Invalid UserRole value: ${value}`)
    }
    return new UserRoleEnumHelper(enumValue)
  }

  getValue(): UserRoleEnum {
    return this.value
  }

  getLabel(): string {
    switch (this.value) {
      case UserRoleEnum.ADMIN:
        return 'Administrator'
      case UserRoleEnum.MEMBER:
        return 'Member'
      case UserRoleEnum.GUEST:
        return 'Guest'
      default:
        return 'Unknown'
    }
  }

  static getAllLabels(): Record<UserRoleEnum, string> {
    return {
      [UserRoleEnum.ADMIN]: 'Administrator',
      [UserRoleEnum.MEMBER]: 'Member',
      [UserRoleEnum.GUEST]: 'Guest',
    }
  }

  static getOptions(): Array<{ value: UserRoleEnum; label: string }> {
    return Object.values(UserRoleEnum).map((role) => ({
      value: role,
      label: new UserRoleEnumHelper(role).getLabel(),
    }))
  }
}
