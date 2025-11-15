# Set up infra

Go to https://github.com/asinkxcoswt/online-learning-infra and follow its README.md to set up infra

# Getting Started

1. Installing AWS CLI and configure the credentials to your target account
2. Checkout the source code, main branch
3. Open `stacks/configurations/local.ts` and edit the VPC_ID, SUBNET_IDS, and the SECURITY_GROUP_ID from the infra resuources applied previously
4. Run `yarn install`
5. Run `yarn dev`, the URL for your local environment will be printed in the console.
6. To deploy production mode, run `yarn build` and then `yarn deploy:production`

# Testing the API

## Postman Collection

https://altimetry-geoscientist-13134586-5760781.postman.co/workspace/Pawz-(%E0%B8%99%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B9%81%E0%B8%87%E0%B8%A7)'s-Workspace~caa95efa-ee25-42c8-8e5f-47497b498363/request/49977777-c1df57f5-08d4-4aaf-8faa-3b0e22b7197f?action=share&creator=49977777&ctx=documentation

## Example Requests

### Register

```
curl --location 'https://cognito-idp.us-east-1.amazonaws.com/' \
--header 'Content-Type: application/x-amz-json-1.1' \
--header 'X-Amz-Target: AWSCognitoIdentityProviderService.SignUp' \
--data-raw '{
    "ClientId": "<your_cognito_client_id>",
    "Username": "your-email@example.com",
    "Password": "YourStrongPassword123!"
}'
```

### Confirm Email

```
curl --location 'https://cognito-idp.us-east-1.amazonaws.com/' \
--header 'Content-Type: application/x-amz-json-1.1' \
--header 'X-Amz-Target: AWSCognitoIdentityProviderService.ConfirmSignUp' \
--data-raw '{
    "ClientId": "<your_cognito_client_id>",
    "Username": "your-email@example.com",
    "ConfirmationCode": "123456"
}'
```

### Get Token

```
curl --location 'https://cognito-idp.us-east-1.amazonaws.com/' \
--header 'Content-Type: application/x-amz-json-1.1' \
--header 'X-Amz-Target: AWSCognitoIdentityProviderService.InitiateAuth' \
--data-raw '{
    "AuthFlow": "USER_PASSWORD_AUTH",
    "ClientId": "<your_cognito_client_id>",
    "AuthParameters": {
        "USERNAME": "your-email@example.com",
        "PASSWORD": "YourStrongPassword123!"
    }
}'
```

### POST /upload

**Request**

```
curl --location 'https://vjeilcwurd.execute-api.us-east-1.amazonaws.com/upload' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <access_token>'
--data '{
	"title": "Test video",
    "userId": "1234",
    "contentType": "media/mp4"
}'
```

**Response**

```
{
    "id": "1234-0d1c1fec-dec7-4f9b-b4ee-9addb1b619bb",
    "userId": "1234",
    "title": "Test video",
    "createdAt": "2025-11-11T13:04:15.872Z",
    "s3Key": "videos/1234/1234-0d1c1fec-dec7-4f9b-b4ee-9addb1b619bb.mp4",
    "contentType": "media/mp4",
    "presignUploadUrl": {
        "url": "<the_long_presigned_upload_url>"
    }
}
```

### Upload the actual file

```
curl -X PUT \
 -v \
  -T /path/to/your/file.mp4 \
  -H "Content-Type: media/mp4" \
  "<the_long_presigned_upload_url>"
```

### GET /video/{id}

```
curl --header 'Content-Type: application/json' \
--header 'Authorization: Bearer <access_token>' \
--location 'https://vjeilcwurd.execute-api.us-east-1.amazonaws.com/videos/1234-84361b71-9c05-4dbc-b6ba-1b56116b674b'


```

(replace the `1234-84361b71-9c05-4dbc-b6ba-1b56116b674b` with your id from the upload response)
