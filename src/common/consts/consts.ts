export function validateRegisterFields(
  fieldName: string,
  isUseRegex: string | null,
  isValidateLength: boolean = true
) {
  const validationRules: any = {
    required: `${fieldName} is required.`,
    validate: (value: string) => {
      if (isValidateLength && value.length <= 8) {
        return `${fieldName} must be at least 8 characters long.`
      }
      return true
    },
  }

  if (isUseRegex) {
    validationRules.pattern = {
      value:
        isUseRegex === 'email'
          ? /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          : isUseRegex === 'username'
          ? /^[A-Za-z][A-Za-z0-9_]{7,29}$/
          : isUseRegex === 'password'
          ? /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
          : null,
      message:
        isUseRegex === 'email'
          ? `Please use a valid email`
          : isUseRegex === 'password'
          ? `Password needs to have at least 8 characters with an uppcase letter and at least one special character`
          : `Username must have at least 8 characters.`,
    }
  }
  return validationRules
}