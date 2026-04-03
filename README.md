# Visualizer for iRacing .ibt telemetry

### It is a work in progress. Currently, it has only a few scripts.

## Scripts

### compress_samples.js

It selects only the fastest lap (with minimal number of ticks) and stores the data we need (**Telemetry data** below).
### view_samples.js

It selects only 4 full samples to view all available tick data.
Selected tick numbers are `1`, `10`, `n/2`, `n` throughought the whole session,

### parse_track_coordinates.js

It parses the string of coordinates into the JSON array of Lon/Lat coordinates.

---

# Lap Comparison

### (ENG)

## Idea

This visualization is meant to display a detailed comparison of two laps from iRacing. As I managed to retrieve only the binary `*.ibt` files with the detailed telemetry of the whole session, I compare the best laps of two different sessions (`*.ibt` files). The example visualization includes the two sessions on the Red Bull Ring track (Spielberg, Austria).

## Telemetry data

I've found two proper binary files with the telemetry on the same track. The files include the track metadata (weather, race rules, driver list) that I won't use, as it's not meaningful in the context of lap comparison, and the telemetry by ticks (60 ticks per second) with 1068 different parameters each. So I selected the fastest lap (the one with the least amount of ticks) and the needed parameters, then saved them into JSON:
- `SessionTick` - the number of the tick counting from the session start;
- `LapDist` - the travel distance of the car, the progress in some way (meters);
- `Lat` - the latitude of the car;
- `Lon` - the longitude of the car;
- `Lap` - current lap number (used for selecting the fastest one);
- `Speed` - the speed of the car (meters per second);
- `Throttle` - the percentage of the throttle input (0..1);
- `Brake` - the percentage of the brake input (0..1);
- `SteeringWheelAngle` - the angle of the current steering wheel turn in radians;
- `SteeringWheelAngleMax` - the angle of the maximum steering wheel turn in radians (used for calculating the percentage of the wheel turn in order to compare relatively for potentially different cars);

## Track data

Having the track in the two files is Red Bull Ring, I manually collected the coordinates of the track limits (inner and outer ones) and the finish line. And also I manually selected some checkpoints for the segments to compare.

## Visualization

The visualization shows the comparison of the source lap and the target lap.

The track is divided into segments, and each segment of the source lap is compared to the same segment of the target lap. If the segment is completed faster in the source lap than in the target lap, the source segment is highlighted with green. Otherwise, with red. The target lap is of monotonic color because we use it only as a comparison for our source lap.

Each useful telemetry parameter is displayed in its specific chart relative to the LapDist (distance) parameter. This allows us to compare how late or how early the driver has made some actions relative to the target lap.

---

### (UKR)

## Ідея

Ця візуалізація призначена для детального порівняння двох кіл в iRacing. Оскільки мені вдалося знайти лише бінарні файли `*.ibt` з детальною телеметрією всієї сесії, я порівнюю найкращі кола двох різних сесій (файлів `*.ibt`). Як приклад візуалізації використано дві сесії на трасі Red Bull Ring (Шпільберг, Австрія).

## Дані телеметрії

Я знайшов два підхожих бінарні файли з телеметрією на одній трасі. Файли містять метадані траси (погода, правила гонки, список пілотів), які я не використовував, оскільки вони не мають значення в контексті порівняння кіл. Також у файлах є телеметрія по тіках (60 тіків на секунду), де кожен тік містить 1068 параметрів. Тож я обрав найшвидше коло (те, що має найменшу кількість тіків) і необхідні параметри, після чого зберіг їх у форматі JSON:
* `SessionTick` — номер тіка, рахуючи від початку сесії;
* `LapDist` — пройдена машиною дистанція в метрах, свого роду прогрес (в метрах);
* `Lat` — широта місцезнаходження машини;
* `Lon` — довгота місцезнаходження машини;
* `Lap` — поточний номер кола (використовувався для вибору найшвидшого);
* `Speed` — швидкість автомобіля (в метрах на секунду);
* `Throttle` — відсоток натискання педалі газу (0..1);
* `Brake` — відсоток натискання педалі гальма (0..1);
* `SteeringWheelAngle` — кут повороту керма в радіанах;
* `SteeringWheelAngleMax` — максимальний кут повороту керма в радіанах (використовувався для розрахунку відсотка повороту керма, щоб мати можливість відносно порівняти для потенційно різних авто);

## Дані траси

Оскільки в обох файлах представлена траса Red Bull Ring, я вручну зібрав координати меж траси (внутрішніх і зовнішніх) та лінії фінішу. Також я вручну обрав контрольні точки для сегментів, які будуть порівнюватися.

## Візуалізація

Візуалізація відображає порівняння вихідного кола (source lap) та цільового кола (target lap).

Траса розділена на сегменти, і кожен сегмент вихідного кола порівнюється з відповідним сегментом цільового кола. Якщо сегмент пройдено швидше у вихідному колі, ніж у цільовому, він виділяється зеленим кольором. В іншому випадку — червоним. Цільове коло - монотонне, оскільки ми використовуємо його лише як орієнтир для порівняння нашого вихідного кола.

Кожен корисний параметр телеметрії відображається на окремому графіку відносно параметра `LapDist` (дистанції). Це дозволяє нам порівняти, наскільки пізніше або раніше пілот виконав певні дії порівняно з цільовим колом.
