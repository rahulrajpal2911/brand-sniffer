import axios from "axios";
import { ErrorException } from "../interfaces/CompanyDetail.interface";

export const getCompanyRecords = async () => {
  try {
    const verificationCode = import.meta.env.VITE_VERIFICATION_CODE;
    const response = await axios.post(
      `/.netlify/functions/get-companies`,
      {},
      {
        headers: {
          "x-verification-code": verificationCode,
        },
      }
    );

    return !response.data ? [] : response.data;
  } catch (e) {
    console.error(
      "Some error in processing the data",
      (e as ErrorException).message
    );
    return [];
  }
};
