import { RuckitBan16, RuckitClock20, RuckitKey16, RuckitPasswordDots16, RuckitShieldAlert20 } from './ruckit-icons';

describe('icons for the password reset screens', () => {
  const icons = [
    { icon: RuckitKey16, size: 16 },
    { icon: RuckitBan16, size: 16 },
    { icon: RuckitPasswordDots16, size: 16 },
    { icon: RuckitClock20, size: 20 },
    { icon: RuckitShieldAlert20, size: 20 }
  ];

  icons.forEach(({ icon, size }) => {
    it(`${icon.name} is ${size} px and takes its colour from the theme`, () => {
      expect(icon.name).toBe(`${icon.name.split('-').slice(0, -1).join('-')}-${size}`);
      expect(icon.data).toContain(`width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"`);
      expect(icon.data).toContain('fill="currentColor"');
      expect(icon.data).not.toContain('#FEFEFE');
    });
  });
});
