import React from 'react';
import { Query, Mutation } from 'react-apollo';
import { MockedProvider } from 'react-apollo/test-utils';
import gql from "graphql-tag";
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import wait from 'waait';

configure({ adapter: new Adapter() });

const TODOS_QUERY = gql`
  query todos {
    todos {
      title
    }
  }
`

const ADD_TODO_MUTATION = gql`
  mutation addTodo($title: String!) {
    addTodo(title: $title)
  }
`;

const Component = () => (
  <Query query={TODOS_QUERY}>
    {
      ({ data }) => {
        console.log('render'); return (
        <Mutation mutation={ADD_TODO_MUTATION}>
          {
            addTodo => (
              <div>
                <button onClick={() => { console.log('addTodo'); addTodo({ variables: { title: 'My new todo' } }) }}>
                  Click me to add a todo!
                </button>

                {
                  (data.todos || []).map(({ title }, index) => (
                    <div key={index} className="todo-item">
                      {title}
                    </div>
                  ))
                }
              </div>
            )
          }
        </Mutation>
      )}
    }
  </Query>
);


it('renders without crashing', async () => {
  const mocks = [
    {
      request: {
        query: TODOS_QUERY,
      },
      result: {
        data: {
          todos: [
            {
              title: 'An old todo',
            },
          ],
        },
      },
    },
    {
      request: {
        query: ADD_TODO_MUTATION,
        variables: {
          title: 'My new todo',
        },
      },
      result: {
        data: {
          addTodo: null,
        },
      },
    },
  ];

  const wrapper = mount(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Component />
    </MockedProvider>
  );

  await wait(100);
  wrapper.update();

  console.log(wrapper.debug())

  expect(wrapper.contains('An old todo')).toBe(true);
  expect(wrapper.contains('My new todo')).toBe(false);
  wrapper.find('button').simulate('click');

  await wait(100);
  wrapper.update();

  console.log(wrapper.debug())

  expect(wrapper.contains('An old todo')).toBe(true);
  expect(wrapper.contains('My new todo')).toBe(true);
});
