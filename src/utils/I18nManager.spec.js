import { assert } from 'chai';
import I18nManager from './I18nManager';
import { DEFAULT_FORMAT_INFO } from './constants';

describe('I18nManager', () => {
  let i18n;
  let deI18n;

  before('instantiate new intl manager', () => {
    const formatInfos = {
      'en-US': {
        datePattern: 'dd/MM/yyyy',
        dateTimePattern: 'dd/MM/yyyy HH:mm:ss',
        integerPattern: '#,##0',
        numberPattern: '#,##0.00#######',
        numberDecimalSeparator: '.',
        numberGroupingSeparator: ',',
        numberGroupingSeparatorUse: true,
      },
    };
    i18n = new I18nManager('en-US', [{
      locales: ['en-US'],
      messages: {
        test: 'test',
        subcomponent: {
          hint: 'nested hint'
        }
      },
    }], formatInfos);
    i18n = i18n.register('component', [{
      locales: ['en-US'],
      messages: {
        component: {
          test: 'test component',
          format: 'min={min}, max={max}',
          subcomponent: {
            label: 'nested'
          }
        },
      },
    }]);
  });

  it('should get fallback message', () => {
    deI18n = new I18nManager('de-DE', [], {});

    deI18n.register('test_component', [
      {
        locales: ['en'],
        messages: {
          component: {
            testMessage1: 'en test message 1',
            testMessage2: 'en test message 2',
          },
        },
      },
      {
        locales: ['de'],
        messages: {
          component: {
            testMessage2: 'de test message 2',
          },
        },
      },
    ]);

    assert.equal('en test message 1', deI18n.getMessage('component.testMessage1'));
    assert.equal('de test message 2', deI18n.getMessage('component.testMessage2'));
    assert.equal('component.testMessage3', deI18n.getMessage('component.testMessage3'));
  });

  it('should contain test message', () => {
    const message = i18n.getMessage('test');
    assert.equal('test', message);
  });

  it('should contain component test message', () => {
    const message = i18n.getMessage('component.test');
    assert.equal('test component', message);
  });

  it('test object message', () => {
    const message = i18n.getMessage('component');
    assert.equal('component', message);
  });

  it('should format and parse date', () => {
    const date = new Date(2001, 0, 10);
    const dateAsString = i18n.formatDate(date);
    assert.equal('10/01/2001', dateAsString);

    const dateAsObject = i18n.parseDate(dateAsString);
    assert.equal(date.toString(), dateAsObject.toString());
  });

  it('should format and parse date and time', () => {
    const date = new Date(2001, 0, 10);
    const dateTimeAsString = i18n.formatDateTime(date);
    assert.equal('10/01/2001 00:00:00', dateTimeAsString);
  });

  it('should format and parse numbers', () => {
    assert.equal('10,000', i18n.formatNumber(10000));
    assert.equal(10000, i18n.parseNumber('10,000'));

    assert.equal('10,000.00', i18n.formatDecimalNumber(10000));
    assert.equal(10000, i18n.parseDecimalNumber('10,000.00'));

    assert.strictEqual(i18n.formatDecimalNumber(123456789.12), '123,456,789.12');
    assert.strictEqual(i18n.formatDecimalNumber(55454545.12), '55,454,545.12');
  });

  it('should format and parse numbers with numberDecimalSeparatorUseAlways=true (1)', () => {
    const formatInfos = {
      'en-US': {
        datePattern: 'dd/MM/yyyy',
        dateTimePattern: 'dd/MM/yyyy HH:mm:ss',
        integerPattern: '#,##0',
        numberPattern: '#,##0.00#######',
        numberDecimalSeparator: '.',
        numberGroupingSeparator: ',',
        numberGroupingSeparatorUse: true,
        numberDecimalSeparatorUseAlways: true
      },
    };
    let i18n = new I18nManager('en-US', [{
      locales: ['en-US'],
      messages: {
        test: 'test',
        subcomponent: {
          hint: 'nested hint'
        }
      },
    }], formatInfos);
    i18n = i18n.register('component', [{
      locales: ['en-US'],
      messages: {
        component: {
          test: 'test component',
          format: 'min={min}, max={max}',
          subcomponent: {
            label: 'nested'
          }
        },
      },
    }]);

    assert.equal('10,000.', i18n.formatNumber(10000));
    assert.equal(10000, i18n.parseNumber('10,000'));
  });

  it('should format and parse numbers with numberDecimalSeparatorUseAlways=true (2)', () => {
    const formatInfos = {
      'en-US': {
        datePattern: 'dd/MM/yyyy',
        dateTimePattern: 'dd/MM/yyyy HH:mm:ss',
        integerPattern: '#,##0.00',
        numberPattern: '#,##0.00#######',
        numberDecimalSeparator: '.',
        numberGroupingSeparator: ',',
        numberGroupingSeparatorUse: true,
        numberDecimalSeparatorUseAlways: true
      },
    };
    let i18n = new I18nManager('en-US', [{
      locales: ['en-US'],
      messages: {
        test: 'test',
        subcomponent: {
          hint: 'nested hint'
        }
      },
    }], formatInfos);
    i18n = i18n.register('component', [{
      locales: ['en-US'],
      messages: {
        component: {
          test: 'test component',
          format: 'min={min}, max={max}',
          subcomponent: {
            label: 'nested'
          }
        },
      },
    }]);

    assert.equal('10,000.00', i18n.formatNumber(10000));
    assert.equal(10000, i18n.parseNumber('10,000.00'));
  });

  it('should formatted message', () => {
    let message = i18n.getMessage('component.format');
    assert.equal('min={min}, max={max}', message);

    message = i18n.getMessage('component.format', { min: 10, max: 100 });
    assert.equal('min=10, max=100', message);
  });

  it('getMessage using fallback locale', () => {
    const i18n = new I18nManager('de', [
      {
        locales: ['en'],
        messages: {
          a: 'fallback'
        },
      }
    ]);
    // there is no message in default/current locale 'de'
    // fallback to default locale -> 'en' message
    assert.strictEqual(i18n.getMessage('a'), 'fallback');
  });

  it('dateFormat returns configured date format', () => {
    const i18n = new I18nManager('es', null,
      {
        'es': {
          datePattern: 'YY',
          dateTimePattern: 'dd/MM/yyyy HH:mm:ss',
          integerPattern: '#,##0',
          numberPattern: '#,##0.00#######',
          numberDecimalSeparator: '.',
          numberGroupingSeparator: ',',
          numberGroupingSeparatorUse: true,
        }
      }
    );
    // configured date pattern
    assert.strictEqual(i18n.dateFormat, 'YY');
  });

  it('dateFormat returns default date format', () => {
    const i18n = new I18nManager('en', null);
    // default date pattern
    assert.strictEqual(i18n.dateFormat, DEFAULT_FORMAT_INFO.datePattern);
  });
});
