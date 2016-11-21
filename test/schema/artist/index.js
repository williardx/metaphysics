import { assign } from 'lodash';

import gravity from '../../../lib/loaders/gravity';
import schema from '../../../schema';

describe('Artist type', () => {
  const Artist = schema.__get__('Artist');
  let artist = null;

  beforeEach(() => {
    artist = gravity.mockForPath('artist/banksy');

    Artist.__Rewire__('positron', sinon.stub().returns(
      Promise.resolve({
        count: 22,
      })
    ));

    const total = sinon.stub();
    total
      .onCall(0)
      .returns(Promise.resolve(42));
    Artist.__Rewire__('total', total);
  });

  afterEach(() => {
    gravity.resetMockForPath('artist/banksy');
    Artist.__ResetDependency__('total');
    Artist.__ResetDependency__('positron');
  });

  itMatchesRecording(`
    {
      artist(id: "banksy") {
        id
        name
        blurb
        counts {
          partner_shows
          related_artists
          articles
        }
        biography_blurb(partner_bio: true) {
          credit
          partner_id
        }
      }
    }
  `);

  it('returns false if artist has no metadata', () => {
    artist.blurb = null;
    artist.nationality = null;
    artist.years = null;
    artist.hometown = null;
    artist.location = null;

    const query = `
      {
        artist(id: "banksy") {
          has_metadata
        }
      }
    `;

    return runQuery(query)
      .then(data => {
        expect(data).to.eql({
          artist: {
            has_metadata: false,
          },
        });
      });
  });

  describe('when formatting nationality and birthday string', () => {
    beforeEach(() => {
      artist.nationality = null;
    });

    it('replaces born with b.', () => {
      artist.nationality = null;
      artist.birthday = 'Born 2000';

      const query = `
        {
          artist(id: "banksy") {
            formatted_nationality_and_birthday
          }
        }
      `;

      return runQuery(query)
        .then(data => {
          expect(data).to.eql({
            artist: {
              formatted_nationality_and_birthday: 'b. 2000',
            },
          });
        });
    });

    it('adds b. to birthday if only a date is provided', () => {
      artist.birthday = '2000';

      const query = `
        {
          artist(id: "banksy") {
            formatted_nationality_and_birthday
          }
        }
      `;

      return runQuery(query)
        .then(data => {
          expect(data).to.eql({
            artist: {
              formatted_nationality_and_birthday: 'b. 2000',
            },
          });
        });
    });

    it('does not change birthday if birthday contains Est.', () => {
      artist.birthday = 'Est. 2000';

      const query = `
        {
          artist(id: "banksy") {
            formatted_nationality_and_birthday
          }
        }
      `;

      return runQuery(query)
        .then(data => {
          expect(data).to.eql({
            artist: {
              formatted_nationality_and_birthday: 'Est. 2000',
            },
          });
        });
    });

    it('returns both if both are provided', () => {
      artist.birthday = '2000';
      artist.nationality = 'Martian';

      const query = `
        {
          artist(id: "banksy") {
            formatted_nationality_and_birthday
          }
        }
      `;

      return runQuery(query)
        .then(data => {
          expect(data).to.eql({
            artist: {
              formatted_nationality_and_birthday: 'Martian, b. 2000',
            },
          });
        });
    });

    it('returns only nationality if no birthday is provided', () => {
      artist.nationality = 'Martian';

      const query = `
        {
          artist(id: "banksy") {
            formatted_nationality_and_birthday
          }
        }
      `;

      return runQuery(query)
        .then(data => {
          expect(data).to.eql({
            artist: {
              formatted_nationality_and_birthday: 'Martian',
            },
          });
        });
    });

    it('returns null if neither are provided', () => {
      artist.nationality = "";
      artist.birthday = "";

      const query = `
        {
          artist(id: "banksy") {
            formatted_nationality_and_birthday
          }
        }
      `;

      return runQuery(query)
        .then(data => {
          expect(data).to.eql({
            artist: {
              formatted_nationality_and_birthday: null,
            },
          });
        });
    });
  });
  describe('concerning works count', () => {
    it('returns a formatted description including works for sale', () => {
      artist.published_artworks_count = 42;
      artist.forsale_artworks_count = 21;

      const query = `
        {
          artist(id: "banksy") {
            formatted_artworks_count
          }
        }
      `;

      return runQuery(query)
        .then(data => {
          expect(data).to.eql({
            artist: {
              formatted_artworks_count: '42 works, 21 for sale',
            },
          });
        });
    });

    it('returns only works if none are for sale', () => {
      artist.published_artworks_count = 42;
      artist.forsale_artworks_count = 0;

      const query = `
        {
          artist(id: "banksy") {
            formatted_artworks_count
          }
        }
      `;

      return runQuery(query)
        .then(data => {
          expect(data).to.eql({
            artist: {
              formatted_artworks_count: '42 works',
            },
          });
        });
    });

    it('returns null when there are no works', () => {
      artist.published_artworks_count = 0;
      artist.forsale_artworks_count = 0;

      const query = `
        {
          artist(id: "banksy") {
            formatted_artworks_count
          }
        }
      `;

      return runQuery(query)
        .then(data => {
          expect(data).to.eql({
            artist: {
              formatted_artworks_count: null,
            },
          });
        });
    });

    it('returns a singular string if only one work for sale', () => {
      artist.published_artworks_count = 1;
      artist.forsale_artworks_count = 0;

      const query = `
        {
          artist(id: "banksy") {
            formatted_artworks_count
          }
        }
      `;

      return runQuery(query)
        .then(data => {
          expect(data).to.eql({
            artist: {
              formatted_artworks_count: '1 work',
            },
          });
        });
    });
  });

  describe('biography_blurb', () => {
    afterEach(() => {
      Artist.__ResetDependency__('gravity');
    });

    describe('with partner_bio set to true', () => {
      describe('with a featured partner bio', () => {
        // beforeEach(() => {
        //   // Artist.__ResetDependency__('gravity');
        //   const gravity = sinon.stub();
        //   Artist.__Rewire__('gravity', gravity);
        //   gravity
        //     // Artist
        //     .onCall(0)
        //     .returns(Promise.resolve(assign({}, artist)))
        //     // PartnerArtist
        //     .onCall(1)
        //     .returns(Promise.resolve([assign({}, {
        //       biography: 'new catty bio',
        //       partner: { name: 'Catty Partner', id: 'catty-partner' },
        //     })]));
        // });

        afterEach(() => {
          const query = `
            {
              artist(id: "banksy") {
                biography_blurb(partner_bio: true) {
                  text
                  credit
                  partner_id
                }
              }
            }
          `;

          return runQuery(query)
            .then(data => {
              expect(data).to.eql({
                artist: {
                  biography_blurb: {
                    text: 'new catty bio',
                    credit: 'Submitted by Catty Partner',
                    partner_id: 'catty-partner',
                  },
                },
              });
            });
        });

        it('returns the featured partner bio without an artsy blurb', () => {
          artist.blurb = null;
        });

        it('returns the featured partner bio with an artsy blurb', () => {
          artist.blurb = 'artsy blurb';
        });
      });

      describe('without a featured partner bio', () => {
        beforeEach(() => {
          gravity.setMockForPath('artist/banksy/partner_artists', []);
        });

        afterEach(() => {
          gravity.resetMockForPath('artist/banksy/partner_artists');
        });

        it('returns the artsy blurb if there is no featured partner bio', () => {
          artist.blurb = 'artsy blurb';
          const query = `
            {
              artist(id: "banksy") {
                biography_blurb(partner_bio: true) {
                  text
                  credit
                  partner_id
                }
              }
            }
          `;

          return runQuery(query)
            .then(data => {
              expect(data).to.eql({
                artist: {
                  biography_blurb: {
                    text: 'artsy blurb',
                    credit: null,
                    partner_id: null,
                  },
                },
              });
            });
        });
      });
    });

    it('returns the blurb if present', () => {
      artist.blurb = 'catty blurb';
      const query = `
        {
          artist(id: "banksy") {
            biography_blurb {
              text
              credit
              partner_id
            }
          }
        }
      `;

      return runQuery(query)
        .then(data => {
          expect(data).to.eql({
            artist: {
              biography_blurb: {
                text: 'catty blurb',
                credit: null,
                partner_id: null,
              },
            },
          });
        });
    });

    it('returns the featured bio if there is no Artsy one', () => {
      gravity.mockForPath('artist/banksy').blurb = null;

      const query = `
        {
          artist(id: "banksy") {
            biography_blurb {
              text
              credit
              partner_id
            }
          }
        }
      `;

      return runQuery(query)
        .then(data => {
          expect(data).to.eql({
            artist: {
              biography_blurb: {
                text: null, /* TODO Is it intended we return this partner when the text is null? */
                credit: 'Submitted by MSP Modern',
                partner_id: 'msp-modern',
              },
            },
          });
        });
    });
  });
});
