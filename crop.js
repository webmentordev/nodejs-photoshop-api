// This API will crop object out of an Image
// Person will be prefered above the object in an image.

const axios = require("axios");
require("dotenv").config();
const api_url = "https://image.adobe.io/pie/psdService/productCrop";

const client_id = process.env.CLIENT_ID.trim();
const client_secret = process.env.CLIENT_SECRET.trim();
const access_token = process.env.ACCESS_TOKEN.trim();
const dropbox_token = process.env.DROPBOX_TOKEN.trim();
const output = crypto.randomUUID();
const file_path = `/adobe/crop/${output}.png`;

const image_url =
  "https://api.rustyuranium.online/api/files/yie3dznps7f1zje/b2kxbotc4zokc2z/c_d_x_pdx_a_82obo_unsplash_Upu3ztkb1V.jpg";

const dropbox = {
  commit_info: {
    autorename: true,
    mode: "add",
    mute: false,
    path: file_path,
    strict_conflict: false,
  },
  duration: 300,
};

axios
  .post(
    `https://api.dropboxapi.com/2/files/get_temporary_upload_link`,
    dropbox,
    {
      headers: {
        Authorization: `Bearer ${dropbox_token}`,
        "Content-Type": "application/json",
      },
    }
  )
  .then((dropbox_reponse) => {
    axios
      .post(
        api_url,
        {
          inputs: [
            {
              href: image_url,
              storage: "external",
            },
          ],
          options: {
            unit: "Pixels",
            width: 20,
            height: 20,
          },
          outputs: [
            {
              href: dropbox_reponse.data.link,
              type: "image/png",
              storage: "dropbox",
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
            "x-api-key": client_id,
          },
        }
      )
      .then((response) => {
        const statusUrl = response.data._links.self.href;
        async function checkStatusAndGetImage() {
          try {
            let jobCompleted = false;

            while (!jobCompleted) {
              const statusResponse = await axios.get(statusUrl, {
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": client_id,
                  Authorization: `Bearer ${access_token}`,
                },
              });

              const statusData = statusResponse;
              // console.log({
              //   "Status response": statusData.data.outputs[0],
              // });
              if (statusData.data.outputs[0].status == "succeeded") {
                jobCompleted = true;
                axios
                  .post(
                    `https://api.dropboxapi.com/2/sharing/create_shared_link`,
                    {
                      path: file_path,
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${dropbox_token}`,
                        "Content-Type": "application/json",
                      },
                    }
                  )
                  .then((dropbox_data) => {
                    console.log({
                      image_url: dropbox_data.data.url.replace("dl=0", "dl=1"),
                    });
                  });
              } else if (statusData.data.outputs[0].status == "failed") {
                throw new Error("Processing failed.");
              } else {
                console.log("Processing... still waiting.");
                await new Promise((resolve) => setTimeout(resolve, 2000));
              }
            }
          } catch (error) {
            console.error(
              "Error:",
              error.response ? error.response.data : error.message
            );
          }
        }
        checkStatusAndGetImage();
      })
      .catch((error) => {
        console.error(
          "Error:",
          error.response ? error.response.data : error.message
        );
      });
  });
