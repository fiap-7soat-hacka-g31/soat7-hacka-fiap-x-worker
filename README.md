# Hackaton FIAP - Fiap X

TODO

## Interacting with Localstack via Aws Cli:

```bash
# list objects
aws --endpoint-url=http://localhost:4566 s3api list-objects --bucket=fiap7soat-f5-hacka
# get object
aws --endpoint-url=http://localhost:4566 s3api get-object-attributes --bucket=fiap7soat-f5-hacka --key=6592008029c8c3e4dc76256c/frame_at_140.png
# delete object
aws --endpoint-url=http://localhost:4566 s3api delete-object --bucket=fiap7soat-f5-hacka --key=6592008029c8c3e4dc76256c/frame_at_140.png
```
