var constants = {
  hashes: {
    all: ['7E5EA8C7', '378AAF3A', 'C42B9288', '3DA4FC37', '4899E282', '0CBC2C50'],
  },
  keys: {
    keyX: '6FBB01F872CAF9C01834EEC04065EE53',
    c: '1FF9E9AAC5FE0408024591DC5D52768A',
    cmac: 'B529221CDDB5DB5A1BF26EFF2041E875',
  },
  dataLocations: {
    ctcert: {
      publicKeyR: { off: 0x108, len: 0x1E },
      publicKeyS: { off: 0x126, len: 0x1E },
      privateKey: { off: 0x180, len: 0x1E },
    },
    movable: {
      keyY: { off: 0x110, len: 0x10 },
    },
    dsiware: {
      banner: { off: 0x0, len: 0x4000 },
      header: { off: 0x4020, len: 0xF0 },
      footer: { off: 0x4130, len: 0x4E0 },
      other: { off: 0x4630 },
    },
  },
  dsiwareContent: [
    'tmd', 'srl.nds', '2.bin', '3.bin', '4.bin', '5.bin',
    '6.bin', '7.bin', '8.bin', 'public.sav', 'banner.sav',
  ],
};
