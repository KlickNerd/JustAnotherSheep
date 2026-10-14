"""Erzeugt den Peacehold-Durchsagegong und macht aus den gesprochenen
Durchsagen Lautsprecher-Ansagen (Gong + blechern gefilterte Stimme, MP3).

Abgestimmtes Tempo: Stimme „Helena" (Higgsfield seed_audio, voice_id
3c2b83c0-2e0a-5ae8-998a-a5fe71b7eccd) mit speech_rate 30 generieren;
dieses Skript verlangsamt sie auf 88 % (TEMPO) bei gleicher Tonhöhe.

Aufruf: python3 scripts/make_announcements.py <wav-ordner> <ziel-ordner>
Benötigt: numpy, ffmpeg mit libmp3lame.
"""
import pathlib
import subprocess
import sys
import wave

import numpy as np

RATE = 44100
TEMPO = 0.88


def bell(freq, seconds, partials=((1.0, 1.0), (2.0, 0.42), (2.76, 0.22), (5.4, 0.08))):
    t = np.linspace(0, seconds, int(RATE * seconds), endpoint=False)
    tone = sum(amp * np.sin(2 * np.pi * freq * ratio * t) * np.exp(-t * (2.2 + ratio * 1.1))
               for ratio, amp in partials)
    attack = np.minimum(1, t / 0.006)
    return tone * attack


def chime():
    total = np.zeros(int(RATE * 2.3))
    for start, freq in ((0.0, 783.99), (0.52, 659.25)):  # G5 → E5, das klassische „Ding-Dong"
        note = bell(freq, 1.75)
        i = int(start * RATE)
        total[i:i + len(note)] += note[: len(total) - i]
    total /= np.max(np.abs(total))
    return (total * 0.42 * 32767).astype(np.int16)


def write_wav(path, samples):
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(samples.tobytes())


def main(src, dst):
    src, dst = pathlib.Path(src), pathlib.Path(dst)
    dst.mkdir(parents=True, exist_ok=True)
    gong = dst.parent / 'chime.tmp.wav'
    write_wav(gong, chime())
    voice_chain = (f'atempo={TEMPO},aresample=44100,aformat=channel_layouts=mono,'
                   'silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:'
                   'stop_duration=0.45:stop_threshold=-45dB:stop_silence=0.25,'
                   'highpass=f=320,lowpass=f=3500,'
                   'acompressor=threshold=-20dB:ratio=4:attack=5:release=120,'
                   'aecho=0.8:0.3:38|76:0.22|0.1,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100,adelay=250')
    for voice in sorted(src.glob('*.wav')):
        out = dst / f'{voice.stem}.mp3'
        subprocess.run([
            'ffmpeg', '-y', '-loglevel', 'error', '-i', str(gong), '-i', str(voice),
            '-filter_complex', f'[1:a]{voice_chain}[v];[0:a][v]concat=n=2:v=0:a=1,alimiter=limit=0.9[out]',
            '-map', '[out]', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '64k', str(out),
        ], check=True)
        print(out.name, out.stat().st_size // 1024, 'KB')
    gong.unlink()


if __name__ == '__main__':
    main(*sys.argv[1:3])
