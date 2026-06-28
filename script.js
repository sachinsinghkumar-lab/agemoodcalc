let ageModel, moodModel;

async function loadModels() {
  ageModel = await tf.loadLayersModel('./image-age/model.json');
  moodModel = await tf.loadLayersModel('./image-mood/model.json');
  console.log('Models loaded successfully');
}

async function predict() {
  const fileInput = document.getElementById('imageUpload');
  const output = document.getElementById('output');

  if (!fileInput.files.length) {
    output.textContent = 'Please upload an image first.';
    return;
  }

  const img = document.createElement('img');
  img.src = URL.createObjectURL(fileInput.files[0]);
  await new Promise(resolve => (img.onload = resolve));

  const tensor = tf.browser.fromPixels(img)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .expandDims();

  const agePrediction = ageModel.predict(tensor);
  const moodPrediction = moodModel.predict(tensor);

  const ageValue = agePrediction.dataSync()[0].toFixed(0);
  const moodValue = moodPrediction.dataSync()[0].toFixed(2);

  output.innerHTML = `
    <p>Estimated Age: <span class="text-blue-400">${ageValue}</span></p>
    <p>Mood Score: <span class="text-green-400">${moodValue}</span></p>
  `;
}

document.getElementById('predictBtn').addEventListener('click', predict);
loadModels();

