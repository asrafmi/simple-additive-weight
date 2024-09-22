const connection = require("./connection");

async function getKriteria() {
  const [kriteria] = await (
    await connection()
  ).execute("SELECT * FROM kriteria");
  return kriteria;
}

async function getKaryawan() {
  const [karyawan] = await (
    await connection()
  ).execute("SELECT * FROM karyawan");
  return karyawan;
}

async function getNilaiKaryawan(idKaryawan, idKriteria) {
  const [nilaiKaryawan] = await (
    await connection()
  ).execute("SELECT * FROM penilaian WHERE idKaryawan = ? AND idKriteria = ?", [
    idKaryawan,
    idKriteria,
  ]);
  return nilaiKaryawan;
}

async function getExtremumNilai(idKriteria, kategori) {
  const [nilaiMaxMin] = await (
    await connection()
  ).execute(
    `SELECT ${
      kategori === "Benefit" ? "MAX" : "MIN"
    }(nilai) AS extremum FROM penilaian WHERE idKriteria = ?`,
    [idKriteria]
  );
  return nilaiMaxMin[0].extremum;
}

async function hitungSAW() {
  const kriteria = await getKriteria();
  const karyawan = await getKaryawan();
  const hasilKaryawan = [];

  for (const karyawanItem of karyawan) {
    let skorAkhir = 0;

    for (const kriteriaItem of kriteria) {
      const { idKriteria, bobot, jenis: kategori } = kriteriaItem;
      const nilaiKaryawan = await getNilaiKaryawan(
        karyawanItem.idKaryawan,
        idKriteria
      );

      if (nilaiKaryawan.length > 0) {
        const nilai = nilaiKaryawan[0].nilai;
        const extremum = await getExtremumNilai(idKriteria, kategori);

        const nilaiTernormalisasi =
          kategori === "Benefit" ? nilai / extremum : extremum / nilai;
        skorAkhir += nilaiTernormalisasi * bobot;
      }
    }

    hasilKaryawan.push({
      nama: karyawanItem.namaKaryawan,
      skorAkhir: skorAkhir,
    });
  }

  hasilKaryawan.sort((a, b) => b.skorAkhir - a.skorAkhir);

  console.log("Ranking Kandidat Terbaik:");
  hasilKaryawan.forEach((hasil) => {
    console.log(
      `Nama: ${hasil.nama}, Skor Akhir: ${hasil.skorAkhir.toFixed(2)}`
    );
  });

  return hasilKaryawan;
}

hitungSAW()
  .catch((err) => {
    console.error("Terjadi kesalahan:", err);
  })
  .finally(async () => {
    (await connection()).end();
  });
