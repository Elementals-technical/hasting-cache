interface SimpleConfiguration {
  Camera: string;
  stage: string;
  accessories: string;
  versattachAccessories: string;
  [key: string]: string;
}

interface Attribute {
  id: string;
  type: string;
  name: string;
  values: string[];
  defaultValue: string;
  enabled: boolean;
  visible: boolean;
  hiddenValues: string[];
  disabledValues: string[];
}

function* generateConfigurations(attributes: Attribute[]): Generator<SimpleConfiguration> {
  const validAttributes = attributes.filter(
    attr => attr.enabled && attr.values.length > 0 && attr.name !== 'stage' && attr.name !== 'accessories' && attr.name !== 'versattachAccessories'
  );

  if (validAttributes.length === 0) {
    const cameraAttr = attributes.find(attr => attr.name === 'Camera' && attr.enabled);
    const stageAttr = attributes.find(attr => attr.name === 'stage' && attr.enabled);
    yield {
      Camera: cameraAttr?.values[0] || cameraAttr?.defaultValue || 'Main Camera',
      stage: stageAttr?.values[0] || 'WhiteRoom',
      accessories: '',
      versattachAccessories: '',
    };
    return;
  }

  const optionValues = validAttributes.map(attr => 
    attr.values.filter(val => !attr.hiddenValues.includes(val) && !attr.disabledValues.includes(val))
  );

  const stageAttr = attributes.find(attr => attr.name === 'stage' && attr.enabled);
  const stage = stageAttr?.values[0] || 'WhiteRoom';
  const cameraAttr = attributes.find(attr => attr.name === 'Camera' && attr.enabled);
  const defaultCamera = cameraAttr?.values[0] || cameraAttr?.defaultValue || 'Main Camera';

  for (const combination of cartesianProductGenerator(optionValues)) {
    const configuration: SimpleConfiguration = {
      Camera: defaultCamera,
      stage: stage,
      accessories: '',
      versattachAccessories: '',
    };

    validAttributes.forEach((attr, index) => {
      configuration[attr.name] = combination[index];
    });

    yield configuration;
  }
}

function* cartesianProductGenerator(arrays: string[][]): Generator<string[]> {
  if (arrays.length === 0) {
    yield [];
    return;
  }
  const [first, ...rest] = arrays;
  for (const value of first) {
    for (const combination of cartesianProductGenerator(rest)) {
      yield [value, ...combination];
    }
  }
}

export { generateConfigurations, SimpleConfiguration, Attribute };