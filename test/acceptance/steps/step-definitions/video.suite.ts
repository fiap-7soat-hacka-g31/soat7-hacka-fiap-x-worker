import { And, Given, Suite, Then, When } from '@fiap-x/acceptance-factory';
import { HttpService } from '@nestjs/axios';
import { strict as assert } from 'assert';
import { randomUUID } from 'crypto';
import * as FormData from 'form-data';
import { createReadStream } from 'fs';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

@Suite()
export class VideoSuite {
  private id: string;
  private signedUrl: string;

  private bearer: string;

  constructor(private readonly http: HttpService) {}

  private async getBearerToken() {
    const baseURL = 'http://localhost:3400';
    const random = randomUUID().split('-').at(0);
    const payload = {
      name: `Jack Sparrow ${random}`,
      email: `${random}-jack@sparrow.com`,
      password: 'j@cK!123Yay',
    };

    const res = await this.http.axiosRef.post(
      `${baseURL}/v1/auth/sign-up`,
      payload,
    );

    return `Bearer ${res.data.access_token}`;
  }

  @Given('a video is sent to the service')
  async createVideo() {
    this.bearer = await this.getBearerToken();
    const filename = `${randomUUID()}.mp4`;
    const form = new FormData();
    const path = join(__dirname, '..', '..', '..', 'resources', 'video.mp4');
    const stream = createReadStream(path);
    form.append('file', stream, { filename });
    const res = await this.http.axiosRef.post(
      'http://localhost:4000/v1/me/videos',
      {
        filename: 'My Awesome Video',
        snapshotIntervalInSeconds: 10,
      },
      { headers: { Authorization: this.bearer } },
    );
    this.id = res.data.id;
    this.signedUrl = res.data.signedUrlForUpload;
    await setTimeout(500);
  }

  @When('the app finishes storing the video')
  async appFinishedStoringVideo() {
    // noop: response is synchronous
  }

  @Then('the user received the video id')
  async verifyIdExists() {
    assert.ok(this.id);
  }

  @And('the user received the video upload signed url')
  async verifySignedUrlExists() {
    assert.ok(this.signedUrl);
  }
}
