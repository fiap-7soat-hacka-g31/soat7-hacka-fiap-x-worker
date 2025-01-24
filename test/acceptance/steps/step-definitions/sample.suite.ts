import { Given, Suite, Then, When } from '@fiap-x/acceptance-factory';
import { strict as assert } from 'assert';

@Suite()
export class SampleSuite {
  private state: string;

  @Given('some scenario')
  async scenario() {
    this.state = 'ok';
  }

  @When('trigger condition happens')
  async trigger() {
    this.state = 'okok';
  }

  @Then('scenario is verified')
  async verifyIdExists() {
    assert.equal(this.state, 'okok');
  }
}
