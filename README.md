# Introduction

This project involves calling Photoshop APIs for photo manipulation in Node.js. Dropbox is used as the file storage system, serving as a critical component since all edited, modified, manipulated, generated, or cropped photos will be stored there. While other options like Azure, AWS S3, Google Drive, and Adobe Cloud are available, Dropbox is the preferred choice due to its free 2GB storage space and well-documented APIs.

Input files, such as PNG, JPEG, PSD, etc., can also be stored in Dropbox **(remember to replace dl=0 with dl=1 in URLs)** or any other link. By "input," I mean the files you will provide to Photoshop API for processing.

We are not using Adobe's Firefly API, as that is an AI tool. Instead, we are utilizing Adobe's official Photoshop API. The attached documentation contains all the details and code examples you need.

This project includes three Photoshop API codes, which function similarly but differ in their responses:

- Replace Smart Object
- Remove Background
- Crop the Object/Person

## How Do Photoshop API Calls Work?

Here's an overview of how it all works: First, we call the Dropbox API to create a temporary (valid for 5 minutes) file upload link, which we then pass to the Adobe Photoshop API. You can refer to the [Temporary File Upload Link](https://www.dropbox.com/developers/documentation/http/documentation#files-get_temporary_upload_link) API Documentation.

Next, we call the Photoshop API with the appropriate configuration, depending on the specific API (e.g., background remover, crop, etc.) you're using. For a complete list of available APIs, consult the official [Adobe Documentation](https://developer.adobe.com/firefly-services/docs/photoshop/api/photoshop_actions/).

The Photoshop API has two main components: The first is the configuration setup, which specifies what you want to do with the image. This step is known as initiating the job. The second component is the Job [Status Checker API](https://developer.adobe.com/firefly-services/docs/photoshop/api/photoshop_status/), which you need to call at intervals (or as often as you like) to check the job's status. Once the job has succeeded, you can stop checking its status.

If the job is successful, the rendered or edited file will need to be uploaded to Dropbox. After that, you'll need to generate a shared link for the file/image uploaded by Adobe. You can do this by calling Dropbox's Create Shared Link API. Refer to the [Create Shared File Link](https://www.dropbox.com/developers/documentation/http/documentation#sharing-create_shared_link) API Documentation. After the link is generated, replace dl=0 with dl=1 in the response, and then you can proceed to store it in your database or simply display the rendered image. You can do whatever you like.
