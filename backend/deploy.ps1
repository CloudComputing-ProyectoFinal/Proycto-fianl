# Deploy script with AWS credentials
$env:AWS_ACCESS_KEY_ID='ASIAVNAY4475WA4N37IW'
$env:AWS_SECRET_ACCESS_KEY='m6cDltXa+BIRisfPGjwRx2Mcy5nhQCfMB7lC+c6o'
$env:AWS_SESSION_TOKEN='IQoJb3JpZ2luX2VjELP//////////wEaCXVzLXdlc3QtMiJIMEYCIQCEJD9OQ6LfyFoecC5b4GwSt9DnM7xz4lRzsDB92+Yh8wIhAM++0Ji/1Q1AjQLcoF+iAuGrwY655HaC546rUlJ6FExJKrQCCHwQABoMMzcxNTY2ODk3MTQ3Igz7M63e1yLcooHQi38qkQJVfnpNvCNQk9JRJi330rkplLu77JIFr1wDZ4HZH6JhP8xPBsaCMZjpkjKAT54/vIHEQqIwcWTPDuihiHcV5sB5R9R4BiAQefdZXOghj0YZG/dH06R7JagOk/jaSZP0owpElGvxVWEyoWj1bzU27sK/de6EpZQeFZy1/aH4IgPVQ83K+ZimmNIk0eifPhMFhDjCDUKny7oXWfq02v/2vfamjErAypcMSXpgqJz8P9ISMZPs0uFvcbDdFqOKT/tVulfpYzVk4qUiChPvU/eYpI3hoNAeTvXBLhfAk7Ulr76iAaStZS8dVs1WtSLiD9b4mbWKT+cGYJ911xrTTrgCgQYvdJse2puuGOVKPbPQgBIe26Awst2ZyQY6nAGPynX0kwTaoJp4sNYsY5EM224eISKm8b4rYUNSpaMw1gyBYjkZkgA9jkhNmWu9CsCce6opcifOwOuzStARAqHfMY+EdyK5J4Rk7ZkMKEPucyPDlC/Em41XyjRGy+IWQSUuz8azoDxkXlhIWZFYtuDuKWUMgXedGo5ZIu5mnPeS7h608m9vYzyYZpAQxfm12sovwmsQcL8i/adn/MI='

Write-Host "Testing AWS credentials..."
aws sts get-caller-identity

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDeploying to AWS..."
    npx serverless deploy --stage dev --verbose
} else {
    Write-Host "`nAWS credentials are invalid. Please refresh them from AWS Academy."
    exit 1
}
