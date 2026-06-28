console.log('Script connected successfully');

let ageModel, moodModel;

async function loadModels() {
  try {
    ageModel = await tf.loadLayersModel('./image-age/model.json');
    console.log('Age model loaded successfully');
    moodModel = await tf.loadLayersModel('./image-mood/model.json');
    console.log('Mood model loaded successfully');
  } catch (err) {
    console.error('Model load error:', err);
  }
}

async function predict() {
  const fileInput = document.getElementById('imageUpload');
  const output = document.getElementById('output');
  const preview = document.getElementById('preview');

  if (!fileInput.files.length) {
    output.textContent = 'Please upload an image first.';
    return;
  }

  if (!ageModel || !moodModel) {
    output.textContent = 'Models not loaded yet. Please wait a few seconds.';
    console.error('Models undefined:', { ageModel, moodModel });
    return;
  }

  // Show preview
  const img = document.createElement('img');
  img.src = URL.createObjectURL(fileInput.files[0]);
  img.className = 'rounded-lg shadow-lg mt-4 w-48 h-48 object-cover';
  preview.innerHTML = '';
  preview.appendChild(img);

  await new Promise(resolve => (img.onload = resolve));

  const tensor = tf.browser.fromPixels(img)
    .resizeNearestNeighbor([224, 224])
    .toFloat()
    .expandDims();

  try {
    const agePrediction = ageModel.predict(tensor);
    const moodPrediction = moodModel.predict(tensor);

    const ageArray = agePrediction.dataSync();
    const moodArray = moodPrediction.dataSync();

    const ageIndex = ageArray.indexOf(Math.max(...ageArray));
    const moodIndex = moodArray.indexOf(Math.max(...moodArray));

    // ✅ Your actual labels
    const ageLabels = ['Child', 'Teen', 'Adult', 'Senior'];
    const moodLabels = ['Happy', 'Sad', 'Angry'];

    const ageLabel = ageLabels[ageIndex] || `Class ${ageIndex}`;
    const moodLabel = moodLabels[moodIndex] || `Class ${moodIndex}`;

    output.innerHTML = `
      <p>Estimated Age Group: <span class="text-blue-400 font-semibold">${ageLabel}</span></p>
      <p>Estimated Mood: <span class="text-green-400 font-semibold">${moodLabel}</span></p>
    `;
  } catch (err) {
    console.error('Prediction error:', err);
    output.textContent = 'Prediction failed. Check console for details.';
  }
}

document.getElementById('predictBtn').addEventListener('click', predict);
loadModels();
