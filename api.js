import axios from 'axios';
import FormData from 'form-data';
import mime from "mime";

const baseUrl = 'https://validator.qvcode.com';

const axiosInstance = axios.create({ baseURL: baseUrl });

export const postQrImage = async (logicalId, imageUri) => {
    try {
        console.log(logicalId, imageUri);
        const newImageUri =  "file:///" + imageUri.uri.split("file:/").join("");
        const formData = new FormData();
        formData.append('logicalId', logicalId);
        formData.append('multipartFile', {
          uri : newImageUri,
          type: mime.getType(newImageUri),
          name: newImageUri.split("/").pop()
         });
        const response = await axiosInstance.post(`/qrcodes/qrcode/counterfeited`, formData, {headers: {'Content-Type': 'multipart/form-data'}});
        console.log(response);
        if(response.status === 200) {
          alert("200 status")
        } else if (response.status === 201) {
          alert(` You have created: ${JSON.stringify(response.data)}`);
        } else if (response.status === 412) {
          alert(response.data.message +" StatusText: "+ response.data.status+ "");
        } else {
          alert("An error has occurred not 201");
        }
      } catch (error) {
        console.log(error);
        alert(error.response.data.message +" StatusText: "+ error.response.data.status+ ", Status code: "+ error.response.status);
      }
}


export const testApi = async () => {
  try {
      const response = await axiosInstance.get(`/`, {});
      console.log(response);
      if(response.status === 200) {
        axioslert("200 status")
      } else if (response.status === 201) {
        alert(` You have created: ${JSON.stringify(response.data)}`);
      } else if (response.status === 412) {
        alert(response.data.message, response.data.status);
      } else {
        throw new Error("An error has occurred not 201");
      }
    } catch (error) {
      console.log(error);
      alert("An error has occurred");
    }
}
