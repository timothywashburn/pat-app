import React from "react";
import { View } from "react-native";
import { render } from "@testing-library/react-native";

describe('<Index />', () => {

    test('CustomText renders correctly', () => {
        const tree = render(<View></View>).toJSON();

        expect(tree).toMatchSnapshot();
    });
});
