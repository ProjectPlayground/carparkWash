import { CarparkPage } from './app.po';

describe('carpark App', function() {
  let page: CarparkPage;

  beforeEach(() => {
    page = new CarparkPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
