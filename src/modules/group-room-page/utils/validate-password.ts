import { MIN_PASSWORD_LENGTH } from "@/constants";

interface IValidatePasswordArgs {
  password: string;
  confirmPassword: string;
}
export const validatePassword = ({
  password,
  confirmPassword,
}: IValidatePasswordArgs): string | null => {
  const trimmedPw = password.trim();
  const trimmedConfirmedPw = confirmPassword.trim();

  if (trimmedPw.length < MIN_PASSWORD_LENGTH) {
    return "group.err_member_password_short";
  }
  if (trimmedPw !== trimmedConfirmedPw) {
    return "group.member_password_mismatch";
  }
  return null;
};
