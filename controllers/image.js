//API key from Clarifai using grpc
const {ClarifaiStub, grpc} = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", "Key api_key");

//API key from Clarifai using REST.
// const app = new Clarifai.App({
//   apiKey: 'clarifai-api-key'
//  });

const handleApiCall = (req, res) => {
    stub.PostModelOutputs(
        {
            // This is the model ID of a publicly available General model. You may use any other public or custom model ID.
            model_id: "face-detection",
            inputs: [{data: {image: {url: req.body.input}}}]
        },
        metadata,
        (err, response) => {
            if (err) {
                console.log("Error: " + err);
                return;
            }

            if (response.status.code !== 10000) {
                console.log("Received failed status: " + response.status.description + "\n" + response.status.details);
                return;
            }

            console.log("Predicted concepts, with confidence values:")
            for (const c of response.outputs[0].data.concepts) {
                console.log(c.name + ": " + c.value);
            }
            res.json(response)
        }
    );

    //Using REST api
    // app.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    // .then(data => {
    //     res.json(data)
    // })
    // .catch(err => res.status(400).json('unable to work with api'))
}

const handleImage = (req, res, db) => {
    //destructuring to get id varaible(property) from body
    const { id } = req.body;
    //using 'incrememnt' from knex docs
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0].entries);
    })
    .catch(err => res.status(400).json('unable to get entries count'))
}

module.exports = {
    handleImage: handleImage,
    handleApiCall: handleApiCall
}