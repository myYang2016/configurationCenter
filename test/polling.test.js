const { ajax } = require('./common');

(() => {
  const run = async (id) => {
    const formData = {
      key: 'testName',
    };
    if (id) {
      formData.id = id;
    }
    const result = JSON.parse(await ajax({
      url: 'http://localhost:9000/api/listenData',
      formData,
    }));
    console.log('!!!!!!!!');
    console.log(result.data);
    run(result.data.id);
  };
  run();

  // ajax({
  //   url: 'http://localhost:9000/api/updateData',
  //   formData: {
  //     key: 'myKey',
  //     json: JSON.stringify({
  //       name: 'yao',
  //       age: 34,
  //     })
  //   }
  // }).then(console.log);
})();
