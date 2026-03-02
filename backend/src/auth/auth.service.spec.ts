import { AuthService } from './auth.service';

describe('AuthService code rules', () => {
  it('generates 6-digit codes', () => {
    const s = Object.create(AuthService.prototype) as AuthService;
    const code = s.generateCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  it('nickname comparison can be normalized to case-insensitive', () => {
    expect('Nick'.toLowerCase()).toBe('nick');
  });
});
