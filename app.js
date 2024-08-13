// This API will replace Smart Objects with logo/images.
// Example, apply already build effects on a logo
// It will replace the logo inside the smart object.

const axios = require("axios");
require("dotenv").config();
const api_url = "https://image.adobe.io/pie/psdService/smartObject";

const client_id = process.env.CLIENT_ID.trim();
const client_secret = process.env.CLIENT_SECRET.trim();
const access_token = process.env.ACCESS_TOKEN.trim();
const dropbox_token = process.env.DROPBOX_TOKEN.trim();
const output = crypto.randomUUID();
const file_path = `/adobe/generated/${output}.png`;

const psd_link =
  "https://api.rustyuranium.online/api/files/yie3dznps7f1zje/kmu2u8r0os7beom/template_metal_39BYfpDkSY.psd";
const object_name = "logo";
const image_link =
  "https://api.rustyuranium.online/api/files/yie3dznps7f1zje/dgouesvoxpgp5so/bg_removed_dPbvnbrk2r.png";

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

// Generate Temporary link in Dropbox
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
    // All Photoshop API with Dropbox Link
    axios
      .post(
        api_url,
        {
          inputs: [
            {
              href: psd_link,
              storage: "external",
            },
          ],
          options: {
            layers: [
              {
                name: object_name,
                input: {
                  href: image_link,
                  storage: "external",
                },
              },
            ],
          },
          outputs: [
            {
              href: dropbox_reponse.data.link,
              type: "image/png",
              overwrite: true,
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
        // Keep calling Status API if status is running.
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
              // console.log({
              //   "Status response": statusResponse.data.outputs[0],
              // });
              if (statusResponse.data.outputs[0].status == "succeeded") {
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
              } else if (statusResponse.data.outputs[0].status == "failed") {
                throw new Error("Processing failed.");
              } else {
                console.log("Processing... still waiting.");
                await new Promise((resolve) => setTimeout(resolve, 10000));
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
