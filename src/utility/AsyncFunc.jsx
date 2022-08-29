import React, { Component } from 'react';

export default function asyncComponent(importComponent) {
  class AsyncFunc extends Component {
    constructor(props) {
      super(props);
      this.state = {
        component: null,
      };
    }

    componentWillMount() {
      // When loading starts
    }


    async componentDidMount() {
      this.mounted = true;
      const { default: LoadingComponent } = await importComponent();
      if (this.mounted) {
        this.setState({
          component: <LoadingComponent {...this.props} />,
        });
      }
    }

    componentWillUnmount() {
      this.mounted = false;
    }

    render() {
      // eslint-disable-next-line react/destructuring-assignment
      const component = this.state.component || <div />;
      return component;
    }
  }
  return AsyncFunc;
}
